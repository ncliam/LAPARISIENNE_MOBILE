import { useCheckout } from "@/hooks";
import { useAtomValue } from "jotai";
import { cartTotalState } from "@/state";
// import { formatPrice } from "@/utils/format";
import { Button } from "zmp-ui";
import { useState } from "react";

export default function Pay() {
  const { totalItems } = useAtomValue(cartTotalState);
  const checkout = useCheckout();
  const [paying, setPaying] = useState(false);

  return (
    <div className="flex-none flex items-center py-3 px-4 space-x-2 bg-section">
      <div className="space-y-1 flex-1">
        <div className="text-xs text-subtitle">SỐ LƯỢNG</div>
        <div className="text-sm font-medium text-primary">
          {totalItems} cái
        </div>
      </div>
      <Button
        onClick={async () => {
          setPaying(true);
          await checkout();
          setPaying(false);
        }}
        disabled={paying}
      >
        Xác nhận
      </Button>
    </div>
  );
}
