import { atom } from "jotai";
import { atomFamily, atomWithStorage, atomWithRefresh, loadable, unwrap } from "jotai/utils";
import {
  Cart,
  Category,
  Delivery,
  Location,
  Order,
  OrderStatus,
  Product,
  ShippingAddress,
  Station,
  UserInfo,
} from "@/types";
import { requestWithFallback } from "@/utils/request";
import { getLocation, getSetting, getUserInfo } from "zmp-sdk";
import { calculateDistance } from "./utils/location";
import CONFIG from "./config";
import { getAccessToken } from "zmp-sdk/apis";
import { Engine } from 'json-rules-engine';
import { isZalo } from "@/utils/platform";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";


export const userInfoKeyState = atom(0);

export const userInfoState = atom<Promise<UserInfo>>(async (get) => {
  // Trigger re-evaluation when userInfoKeyState changes
  get(userInfoKeyState);

  const savedUserInfo = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
  if (savedUserInfo) {
    return JSON.parse(savedUserInfo);
  }

  // ZALO MODE: Use Zalo SDK
  if (isZalo()) {
    const {
      authSetting: {
        "scope.userInfo": grantedUserInfo
      },
    } = await getSetting({});

    const isDev = !window.ZJSBridge;
    if (grantedUserInfo || isDev) {
      // Người dùng cho phép truy cập tên và ảnh đại diện
      const { userInfo } = await getUserInfo({});
      return {
        id: userInfo.id,
        name: userInfo.name,
        avatar: userInfo.avatar || CONFIG.DEFAULT_AVATAR,
        phone: "",
        email: "",
        address: ""
      };
    }
    // Not granted - return null to trigger auth flow
    return null as any;
  }

  // WEB MODE: Check Firebase Auth
  else {
    if (!auth) {
      // No auth configured - return null to trigger login
      return null as any;
    }
    return new Promise((resolve) => {
      onAuthStateChanged(auth!, (user) => {
        if (user) {
          resolve({
            id: user.uid,
            name: user.displayName || "Anonymous",
            avatar: user.photoURL || CONFIG.DEFAULT_AVATAR,
            phone: user.phoneNumber || "",
            email: user.email || "",
            address: ""
          });
        } else {
          // Not logged in - return null to trigger login redirect
          resolve(null as any);
        }
      });
    });
  }
});

export const loadableUserInfoState = loadable(userInfoState);

export const unwrapUserInfoState = unwrap(userInfoState, (prev) => prev ?? {});


export const bannersState = atom(() =>
  requestWithFallback<string[]>("/banners", [])
);

export const tabsState = atom(["Tất cả", "Nam", "Nữ", "Trẻ em"]);

export const selectedTabIndexState = atom(0);

export const categoriesState = atom(() =>
  requestWithFallback<Category[]>("/categories", [])
);

export const categoriesStateUpwrapped = unwrap(
  categoriesState,
  (prev) => prev ?? []
);

// Key to trigger products refresh (e.g., after session/pricing changes)
export const productsKeyState = atom(0);

export const productsState = atom(async (get) => {
  // Trigger re-evaluation when productsKeyState changes
  get(productsKeyState);

  const categories = await get(categoriesState);
  const products = await requestWithFallback<
    (Product & { categoryId: number })[]
  >("/products", []);
  return products.map((product) => ({
    ...product,
    category: categories.find(
      (category) => category.id === product.categoryId
    )!,
  }));
});

export const flashSaleProductsState = atom((get) => get(productsState));

export const recommendedProductsState = atom((get) => get(productsState));

export const productState = atomFamily((id: number) =>
  atom(async (get) => {
    const products = await get(productsState);
    return products.find((product) => product.id == id);
  })
);

export const cartState = atom<Cart>([]);

export const selectedCartItemIdsState = atom<number[]>([]);

export const cartTotalState = atom((get) => {
  const items = get(cartState);
  return {
    totalItems: items.reduce(
      (total, item) => total + item.quantity,
      0
    ),
    totalAmount: items.reduce(
      (total, item) => total + item.unitprice * item.quantity,
      0
    ),
  };
});

export const keywordState = atom("");

export const searchResultState = atom(async (get) => {
  const keyword = get(keywordState);
  const products = await get(productsState);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return products.filter((product) =>
    product.name.toLowerCase().includes(keyword.toLowerCase())
  );
});

export const productsByCategoryState = atomFamily((id: String) =>
  atom(async (get) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const products = await get(productsState);
    return products.filter((product) => String(product.categoryId) === id);
  })
);

export const stationsState = atom(async () => {
  const response = await requestWithFallback<{}>("/stations", {});
  const stations = response['data'] || response || [];
  return stations;
});

export const stationStateWithDistance = atom(async () => {
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // ZALO MODE: Use Zalo location API
  if (isZalo()) {
    const accessToken = await getAccessToken();
    const { token } = await getLocation({});
    headers["X-Zalo-AccessToken"] = accessToken || 'dummy';
    headers["X-Zalo-LocationToken"] = token || 'dummy';
  }
  // WEB MODE: Use Browser Geolocation API
  else {
    let userLocation: {lat: number, lng: number} | null = null;
    if (navigator.geolocation) {
      userLocation = await new Promise<{lat: number, lng: number} | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
          () => resolve(null)
        );
      });
    }
    if (userLocation) {
      headers["X-User-Location"] = JSON.stringify(userLocation);
    }
  }

  const response = await requestWithFallback<{}>("/stations", {}, { headers });
  const stations = response['data'] || [];
  let location = response['customer_location'];

  if (location) {
    location = location as Location;
  }

  const stationsWithDistance = stations.map((station) => ({
    ...station,
    distance: location
      ? calculateDistance(
          location['lat'],
          location.lng,
          station.location.lat,
          station.location.lng
        )
      : undefined,
  }));

  return stationsWithDistance;
});

export const savedStationState = atomWithStorage<
  Station | undefined
>(CONFIG.STORAGE_KEYS.STATION, undefined);

export const selectedStationState = atom(async (get) => {
  const savedStation = get(savedStationState);
  if (savedStation) {
    const stations = await get(stationsState);
    const match_stations = stations.filter((s) =>
      s.id == savedStation.id
    );
    return (match_stations.length > 0) ? match_stations[0] : undefined;
  }
  return undefined;
  
});

export const shippingAddressState = atomWithStorage<
  ShippingAddress | undefined
>(CONFIG.STORAGE_KEYS.SHIPPING_ADDRESS, undefined);

export const sessionState = atomWithStorage<any>(CONFIG.STORAGE_KEYS.SESSION, null);

export const allOrdersState = atomWithRefresh(async (get) => {
    const sessionInfo = await get(sessionState);
    if (!sessionInfo)
      return [];

    const allOrders = await requestWithFallback<Order[]>("/orders", [], {
      headers: {
          "Content-Type": "application/json",
          "X-Session-Info": JSON.stringify(sessionInfo), 
      },
    });
    return allOrders;
})


export const ordersState = atomFamily((status: OrderStatus[]) =>
  atom(async (get) => {
    const allOrders = await get(allOrdersState)
    const clientSideFilteredData = allOrders.filter(
      (order) => status.includes(order.status)
    );
    return clientSideFilteredData;
  })
);

export const deliveryModeState = atomWithStorage<Delivery["type"]>(
  CONFIG.STORAGE_KEYS.DELIVERY,
  "shipping"
);

export const deliveryRuleState = atom(async () => {
  const response = await requestWithFallback<{}>("/delivery_rules", {});
  const rules = response['data'];
  return rules;
});

export const deliveryFeeState = atom(async (get) => {
  const cartTotal = get(cartTotalState).totalAmount; // Lấy tổng tiền hàng từ giỏ hàng
  const savedStation = get(savedStationState); // Lấy thông tin trạm đã lưu
  const deliveryMode = get(deliveryModeState); // Lấy chế độ giao hàng
  const rules = await get(deliveryRuleState); // Lấy chế độ giao hàng

  // Nếu không phải chế độ giao hàng hoặc không có trạm hoặc không có khoảng cách, phí giao hàng là 0
  if (deliveryMode !== "shipping" || !savedStation || !savedStation.distance) {
    return 0;
  }

  const engine = new Engine();
  rules.forEach((rule) => engine.addRule(rule));

  const testOrder = {
    distance: savedStation.distance, // khoảng cách km
    orderAmount: cartTotal, // đơn hàng VND
  };
  console.log(testOrder);

  let deliveryFee = 0; // Biến lưu phí giao hàng

  await engine
    .run(testOrder)
    .then(({ events }) => {
      if (events.length === 0) {
        console.log("Không áp dụng được rule nào.");
        return;
      }
      const event = events[0];

      if (event.type === "fixedRate") {
        if (event.params) {
          deliveryFee = testOrder.distance * event.params.ratePerKm;
        } else {
          console.warn("Event parameters are undefined.");
        }
      } else if (event.type === "mixedRate") {
        const { firstKm, firstRate, extraRate } = event.params ?? {};
        const extraDistance = Math.max(testOrder.distance - firstKm, 0);
        deliveryFee =
          Math.min(testOrder.distance, firstKm) * firstRate +
          extraDistance * extraRate;
      }
    })
    .catch(console.error);

  return deliveryFee; // Trả về phí giao hàng
});

