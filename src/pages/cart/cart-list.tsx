import { useAtomValue } from "jotai";
import { cartState } from "@/state";
import CartItem from "./cart-item";
import Section from "@/components/section";
import HorizontalDivider from "@/components/horizontal-divider";

export default function CartList() {
  const cart = useAtomValue(cartState);

  return (
    <Section
      title={
        <div>Danh sách đã đặt hàng</div>
      }
      className="flex-1 overflow-y-auto rounded-lg"
    >
      <HorizontalDivider />
      <div className="w-full">
        {cart.map((item) => (
          <CartItem key={item.product.id} {...item} />
        ))}
      </div>
      {/*
      <HorizontalDivider />
      <div className="flex items-center px-4 pt-3 pb-2 space-x-4">
        <div className="text-sm font-medium">Ghi chú</div>
        <input
          type="text"
          placeholder="Lưu ý cho cửa hàng..."
          className="text-sm text-right flex-1 focus:outline-none"
        />
      </div> */}
    </Section>
  );
}
