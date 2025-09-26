import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MutableRefObject, useLayoutEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { UIMatch, useMatches, useNavigate } from "react-router-dom";
import {
  cartState,
  cartTotalState,
  userInfoKeyState,
  userInfoState,
  deliveryModeState,
  selectedStationState,
  shippingAddressState,
  allOrdersState,
  deliveryFeeState,
  sessionState
} from "@/state";
import { Product } from "@/types";
import { getConfig } from "@/utils/template";
import { authorize, openChat, getSetting, Payment, CheckoutSDK, getPhoneNumber } from "zmp-sdk";
import { useAtomCallback } from "jotai/utils";
import { requestWithPost, requestWithFallback } from "@/utils/request";
import { getAccessToken } from "zmp-sdk/apis";


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
      await authorize({
        scopes: ["scope.userInfo", "scope.userPhonenumber"],
      }).then(refreshPermissions);
      kyc();
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

export function useAddToCart(product: Product) {
  const [cart, setCart] = useAtom(cartState);
  const computePrice = useComputePrice();

  const currentCartItem = useMemo(
    () => cart.find((item) => item.product.id === product.id),
    [cart, product.id]
  );

  const addToCart = (
    quantity: number | ((oldQuantity: number) => number),
    options?: { toast: boolean }
  ) => {
    setCart((cart) => {
      const newQuantity =
        typeof quantity === "function"
          ? quantity(currentCartItem?.quantity ?? 0)
          : quantity;
      if (newQuantity <= 0) {
        cart.splice(cart.indexOf(currentCartItem!), 1);
      } else {
        const newPrice = computePrice(product, newQuantity);
        if (currentCartItem) {
          currentCartItem.quantity = newQuantity;
          currentCartItem.unitprice = newPrice;
        } else {
          cart.push({
            product,
            unitprice: newPrice,
            quantity: newQuantity,
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
  return () =>
    openChat({
      type: "oa",
      id: getConfig((config) => config.template.oaIDtoOpenChat),
    });
}

export function useToBeImplemented() {
  return () =>
    toast("Chức năng đang được phát triển...", {
      icon: "🛠️",
    });
}

async function createOrder(cart, delivery, sessionInfo) {
  const path = "/orders"; // API endpoint
  // Get delivery-related states
  const lines = cart.map((item) => ({
    product: item.product,
    name: item.product.name,
    unitprice: item.unitprice,
    quantity: item.quantity,
  }));
  const payload = {
      lines: lines,
      delivery: delivery,
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
  return async () => {
    const accessToken = await getAccessToken();
    const { token } = await getPhoneNumber({});
    const sessionInfo = await requestWithFallback<any>("/authenticate",
      {},
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Zalo-AccessToken": accessToken || "dummy",
          "X-Zalo-PhoneToken": token || "dummy",
        },
      }
    );
    if (Object.keys(sessionInfo).length > 0) {
        setSession(sessionInfo);
    } else {
        setSession(null);
    }
  }
}

export function useCheckout() {
    const [cart, setCart] = useAtom(cartState);
    const requestInfo = useRequestInformation();
    const deliveryMode = useAtomValue(deliveryModeState); // "shipping" or other modes
    const selectedStation = useAtomValue(selectedStationState); // Selected station info
    const shippingAddress = useAtomValue(shippingAddressState); // Shipping address if delivery mode is "shipping"
    const refreshNewOrders = useSetAtom(allOrdersState);
    const cartTotal = useAtomValue(cartTotalState); // Total amount of the cart
    // const deliveryFee = useAtomValue(deliveryFeeState); // Delivery fee
    const sessionInfo = useAtomValue(sessionState); // User session
    const navigate = useNavigate();
    
  return async () => {
    const delivery =  {
      mode: deliveryMode,
      station: selectedStation,
      address: shippingAddress,
      fee: 0 //deliveryFee
    }
    
    try {
      if (!selectedStation) {
        toast.error("Bạn chưa chọn cửa hàng nào", {
          duration: 2000,
        });
        return;
      }
      if (!shippingAddress && deliveryMode == 'shipping') {
        toast.error("Bạn chưa nhập địa chỉ nhận hàng", {
          duration: 2000,
        });
        return;
      }
      await requestInfo();
      const {
        authSetting: {
          "scope.userInfo": grantedUserInfo
        },
      } = await getSetting({});
      if (!grantedUserInfo) {
        toast.error("Bạn cần cho chúng tôi quyền lấy số điện thoại để xác nhận đơn hàng", {
          duration: 2000,
        });
        return;
      }


      const { method, isCustom } = await Payment.selectPaymentMethod({
        fail: (err) => {
          // Tắt trang lựa chọn phương thức hoặc xảy ra lỗi
          console.log(err);
        },
      });


      CheckoutSDK.purchase({
        desc: "Thanh toán COD",
        amount: cartTotal.totalAmount,
        method: "COD",
        success: async(data) => {
          // Tạo đơn hàng thành công
          const { orderId } = data;
          await createOrder(cart, delivery, sessionInfo);
          setCart([]);
          refreshNewOrders();
          navigate("/orders", {
            viewTransition: true,
          });
          toast.success("Đặt đơn thành công. Cảm ơn bạn đã ủng hộ!", {
            icon: "🎉",
            duration: 2000,
          });
        },
        fail: (err) => {
          // Tạo đơn hàng lỗi
          console.log(err);
        },
      });

      
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi không đặt được đơn hàng", {
        duration: 2000,
      });
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
