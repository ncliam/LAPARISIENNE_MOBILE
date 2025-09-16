import { useAtomValue } from "jotai";
import { cartTotalState, deliveryFeeState } from "@/state";
import { formatPrice } from "@/utils/format";
import Section from "@/components/section";
import HorizontalDivider from "@/components/horizontal-divider";

export default function CartSummary() {
  const { totalAmount } = useAtomValue(cartTotalState);
  const deliveryFee = useAtomValue(deliveryFeeState);

  return (
    <Section title="Tạm tính" className="rounded-lg">
      <div className="px-4 py-2 space-y-4">
        <div className="flex justify-between font-medium text-sm">
          <div>Tổng tiền</div>
          <div>{formatPrice(totalAmount)}</div>
        </div>
        {/* <HorizontalDivider /> */}

        {!!deliveryFee && (
          <>
            <div className="flex justify-between font-medium text-sm">
              <div>Vận chuyển</div>
              <div>{formatPrice(deliveryFee)}</div>
            </div>
            {/* <HorizontalDivider /> */}
          </>
        )}

        {/* <table className="table w-full text-sm [&_th]:text-justify [&_th]:text-xs [&_th]:text-inactive [&_th]:font-medium [&_td]:text-justify">
          <tbody>
            <tr>
              <td><i>Cửa hàng sau khi nhận được đơn, có thể điều chỉnh lại đơn theo thực tế</i></td>
            </tr>
          </tbody>
        </table> */}
      </div>
    </Section>
  );
}
