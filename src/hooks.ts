import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MutableRefObject, useLayoutEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { UIMatch, useMatches, useNavigate } from "react-router-dom";
import {
  cartState,
  cartTotalState,
  userInfoKeyState,
  userInfoState,
  unwrapUserInfoState,
  deliveryModeState,
  selectedStationState,
  shippingAddressState,
  allOrdersState,
  sessionState,
  productsKeyState
} from "@/state";
import { Product, ComboItem } from "@/types";
import { getConfig } from "@/utils/template";
import { authorize, openChat, getSetting, Payment, CheckoutSDK, getPhoneNumber } from "zmp-sdk";
import { useAtomCallback } from "jotai/utils";
import { requestWithPost, requestWithFallback } from "@/utils/request";
import { getAccessToken } from "zmp-sdk/apis";
import { isZalo } from "@/utils/platform";
import { auth } from "@/utils/firebase";


export function useRealHeight(
  element: MutableRefObject<HTMLDivElement | null>,
  defaultValue?: number
) {
  const [height, setHeight] = useState(defaultValue ?? 0);
  useLayoutEffect(() => {
    if (element.current && typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        const [{ contentRect }] = entries;
        setHeight(contentRect.height);
      });
      ro.observe(element.current);
      return () => ro.disconnect();
    }
    return () => {};
  }, [element.current]);

  if (typeof ResizeObserver === "undefined") {
    return -1;
  }
  return height;
}

export function useRequestInformation() {
  const navigate = useNavigate();
  const hasUserInfo = useAtomCallback(async (get) => {
    const userInfo = await get(userInfoState);
    return !!userInfo;
  });
  const kyc = useKyc();
  const setInfoKey = useSetAtom(userInfoKeyState);
  const refreshPermissions = () => setInfoKey((key) => key + 1);

  return async () => {
    const hadUserInfo = await hasUserInfo();
    if (!hadUserInfo) {
      // ZALO MODE: Request permissions
      if (isZalo()) {
        await authorize({
          scopes: ["scope.userInfo", "scope.userPhonenumber"],
        }).then(refreshPermissions);
        kyc();
      }
      // WEB MODE: Redirect to login
      else {
        navigate('/login');
      }
    }
  };
}

export function useComputePrice() {
  const session_info = useAtomValue(sessionState);
  return (product: Product, quantity: number) => {
    let price = product.price;
    const pricelist_id = session_info?.property_product_pricelist;
    if (pricelist_id) {
      const priceLevels = product.priceLevels[pricelist_id[0]];
      const sortedPrices = [...priceLevels].sort((a, b) => b.min_qty - a.min_qty);
      const matchedPrice = sortedPrices.find(item => quantity >= item.min_qty) || null;
      if (matchedPrice) {
        price = matchedPrice.price;
      }
    }
    return price;
  }
} 

type AddToCartOptions = {
  toast?: boolean;
  unitPriceOverride?: number;
  comboSelections?: ComboItem[];
  detail?: string;
};

export function useAddToCart(product: Product) {
  const [cart, setCart] = useAtom(cartState);
  const computePrice = useComputePrice();

  const currentCartItem = useMemo(
    () => cart.find((item) => item.product.id === product.id),
    [cart, product.id]
  );

  const addToCart = (
    quantity: number | ((oldQuantity: number) => number),
    options?: AddToCartOptions
  ) => {
    setCart((cart) => {
      const itemIndex = cart.findIndex((item) => item.product.id === product.id);
      const targetItem = itemIndex >= 0 ? cart[itemIndex] : undefined;
      const currentQuantity = targetItem?.quantity ?? currentCartItem?.quantity ?? 0;
      const newQuantity =
        typeof quantity === "function" ? quantity(currentQuantity) : quantity;
      if (newQuantity <= 0) {
        if (itemIndex >= 0) {
          cart.splice(itemIndex, 1);
        }
      } else {
        let newPrice: number;
        if (options?.unitPriceOverride !== undefined) {
          newPrice = options.unitPriceOverride;
        } else if ((targetItem ?? currentCartItem)?.comboSelections?.length) {
          newPrice = (targetItem ?? currentCartItem)!.unitprice;
        } else {
          newPrice = computePrice(product, newQuantity);
        }

        if (itemIndex >= 0) {
          cart[itemIndex] = {
            ...cart[itemIndex],
            quantity: newQuantity,
            unitprice: newPrice,
            comboSelections:
              options?.comboSelections ?? cart[itemIndex].comboSelections,
            detail:
              options?.detail !== undefined
                ? options.detail
                : cart[itemIndex].detail,
          };
        } else {
          cart.push({
            product,
            unitprice: newPrice,
            quantity: newQuantity,
            comboSelections: options?.comboSelections,
            detail: options?.detail,
          });
        }
      }
      return [...cart];
    });
    if (options?.toast) {
      toast.success("Đã thêm vào giỏ hàng");
    }
  };

  return { addToCart, cartQuantity: currentCartItem?.quantity ?? 0 };
}

export function useCustomerSupport() {
  return () => {
    // ZALO MODE: Open Zalo chat with OA
    if (isZalo()) {
      openChat({
        type: "oa",
        id: getConfig((config) => config.template.oaIDtoOpenChat),
      });
    }
    // WEB MODE: Open email or chat widget
    else {
      window.location.href = 'mailto:support@laparisienne.com';
    }
  };
}

export function useLogout() {
  const navigate = useNavigate();
  const setSession = useSetAtom(sessionState);

  return async () => {
    try {
      // WEB MODE: Sign out from Firebase
      if (!isZalo() && auth) {
        await auth.signOut();
      }

      // Clear all user data from localStorage
      localStorage.removeItem('userInfo');
      localStorage.removeItem('session');

      // Clear session state
      setSession(null);

      toast.success('Đã đăng xuất');

      // Redirect to home
      navigate('/', { replace: true });

      // Reload to reset all states
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Có lỗi khi đăng xuất');
    }
  };
}

export function useToBeImplemented() {
  return () =>
    toast("Chức năng đang được phát triển...", {
      icon: "🛠️",
    });
}

async function createOrder(cart, delivery, userInfo, sessionInfo) {
  const path = "/orders"; // API endpoint
  // Get delivery-related states
  const lines = cart.map((item) => ({
    product: item.product,
    name: item.product.name,
    unitprice: item.unitprice,
    quantity: item.quantity,
    comboSelections: item.comboSelections,
    detail: item.detail,
  }));
  const payload = {
      customer: userInfo,
      delivery: delivery,
      lines: lines
  }; // Data to send in the POST request

  let options = {
    headers: {
        "Content-Type": "application/json",
        "X-Session-Info": JSON.stringify(sessionInfo),
    },
  };
  
  // throw new Error("Not implemented");
  await requestWithPost<typeof payload, { success: boolean; orderId: number }>(
    path,
    payload,
    options
  );
}

export function useKyc() {
  const setSession = useSetAtom(sessionState);
  const setProductsKey = useSetAtom(productsKeyState);

  return async () => {
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // ZALO MODE: Use Zalo tokens
    if (isZalo()) {
      const accessToken = await getAccessToken();
      const { token } = await getPhoneNumber({});
      headers["X-Zalo-AccessToken"] = accessToken || "dummy";
      headers["X-Zalo-PhoneToken"] = token || "dummy";
    }
    // WEB MODE: Use Firebase ID token
    else {
      const user = auth?.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        headers["X-Firebase-Token"] = idToken;
      }
    }

    const sessionInfo = await requestWithFallback<any>("/authenticate",
      {},
      { method: "POST", headers }
    );

    if (Object.keys(sessionInfo).length > 0) {
        setSession(sessionInfo);
        // Refresh products to update prices based on customer's pricing tier
        setProductsKey((key) => key + 1);
    } else {
        setSession(null);
    }
  }
}

export function useCheckout() {
    const [cart, setCart] = useAtom(cartState);
    const requestInfo = useRequestInformation();
    const deliveryMode = useAtomValue(deliveryModeState);
    const selectedStation = useAtomValue(selectedStationState);
    const shippingAddress = useAtomValue(shippingAddressState);
    const refreshNewOrders = useSetAtom(allOrdersState);
    const cartTotal = useAtomValue(cartTotalState);
    const userInfo = useAtomValue(unwrapUserInfoState);
    const sessionInfo = useAtomValue(sessionState);
    const navigate = useNavigate();

  // Helper function to complete order after payment
  const completeOrder = async (delivery: any) => {
    await createOrder(cart, delivery, userInfo, sessionInfo);
    setCart([]);
    refreshNewOrders();
    navigate("/orders", { viewTransition: true });
    toast.success("Đặt đơn thành công. Cảm ơn bạn đã ủng hộ!", {
      icon: "🎉",
      duration: 2000,
    });
  };

  return async () => {
    const delivery = {
      mode: deliveryMode,
      station: selectedStation,
      address: shippingAddress,
      fee: 0
    };

    try {
      // Validation
      if (!selectedStation) {
        toast.error("Bạn chưa chọn cửa hàng nào", { duration: 2000 });
        return;
      }
      if (!shippingAddress && deliveryMode == 'shipping') {
        toast.error("Bạn chưa nhập địa chỉ nhận hàng", { duration: 2000 });
        return;
      }

      // WEB MODE: Check if user is authenticated before checkout
      if (!isZalo()) {
        const currentUser = auth?.currentUser;
        if (!currentUser) {
          toast.error("Bạn cần đăng nhập để đặt hàng", { duration: 2000 });
          navigate('/login');
          return;
        }
      }

      await requestInfo();

      // ZALO MODE: Use Zalo Payment
      if (isZalo()) {
        const {
          authSetting: { "scope.userInfo": grantedUserInfo },
        } = await getSetting({});

        if (!grantedUserInfo) {
          toast.error("Bạn cần cho chúng tôi quyền lấy số điện thoại để xác nhận đơn hàng", {
            duration: 2000,
          });
          return;
        }

        // Gọi API mở trang lựa chọn phương thức thanh toán
        Payment.selectPaymentMethod({
          success: (data) => {
            const { method } = data;
            CheckoutSDK.purchase({
              desc: "Thanh toán COD",
              amount: cartTotal.totalAmount,
              method: method,
              success: async(data) => {
                await completeOrder(delivery);
              },
              fail: (err) => {
                console.log(err);
                toast.error("Có lỗi không đặt được đơn hàng", { duration: 2000 });
              },
            });
          },
          fail: (err) => {
            console.log(err);
          },
        });
      }

      // WEB MODE: COD only (or integrate Stripe/PayPal later)
      else {
        await completeOrder(delivery);
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi không đặt được đơn hàng", { duration: 2000 });
    }
  };
}

export function useRouteHandle() {
  const matches = useMatches() as UIMatch<
    undefined,
    | {
        title?: string | Function;
        logo?: boolean;
        search?: boolean;
        noFooter?: boolean;
        noBack?: boolean;
        noFloatingCart?: boolean;
        scrollRestoration?: number;
      }
    | undefined
  >[];
  const lastMatch = matches[matches.length - 1];

  return [lastMatch.handle, lastMatch, matches] as const;
}
