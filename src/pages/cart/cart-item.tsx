import { useAddToCart } from "@/hooks";
import { CartItem as CartItemProps } from "@/types";
import { formatPrice } from "@/utils/format";
import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useAtom } from "jotai";
import { selectedCartItemIdsState } from "@/state";
import { useEffect, useState } from "react";
import { Icon } from "zmp-ui";
import QuantityInput from "../../components/quantity-input";


const SWIPE_TO_DELTE_OFFSET = 80;

export default function CartItem(props: CartItemProps) {
  const [quantity, setQuantity] = useState(props.quantity);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(props.detail ?? "");
  const { addToCart, cartQuantity } = useAddToCart(props.product);

  const [selectedItemIds, setSelectedItemIds] = useAtom(
    selectedCartItemIdsState
  );

  useEffect(() => {
    setNoteValue(props.detail ?? "");
  }, [props.detail]);

  // update cart
  useEffect(() => {
    addToCart(quantity);
  }, [quantity]);

  const handleNoteSave = () => {
    const trimmedNote = noteValue.trim();
    addToCart((oldQuantity) => (oldQuantity === 0 ? 1 : oldQuantity), {
      detail: trimmedNote.length ? trimmedNote : undefined,
    });
    setIsEditingNote(false);
  };

  // swipe left to delete animation
  const [{ x }, api] = useSpring(() => ({ x: 0 }));
  const bind = useDrag(
    ({ last, offset: [ox] }) => {
      if (last) {
        if (ox < -SWIPE_TO_DELTE_OFFSET) {
          api.start({ x: -SWIPE_TO_DELTE_OFFSET });
        } else {
          api.start({ x: 0 });
        }
      } else {
        api.start({ x: Math.min(ox, 0), immediate: true });
      }
    },
    {
      from: () => [x.get(), 0],
      axis: "x",
      bounds: { left: -100, right: 0, top: 0, bottom: 0 },
      rubberband: true,
      preventScroll: true,
    }
  );

  return (
    <div className="relative after:border-b-[0.5px] after:border-black/10 after:absolute after:left-[88px] after:right-0 after:bottom-0 last:after:hidden">
      {/* <div className="absolute right-0 top-0 bottom-0 w-20 py-px">
        <div
          className="bg-danger text-white/95 w-full h-full flex flex-col space-y-1 justify-center items-center cursor-pointer"
          onClick={() => addToCart(0)}
        >
          <Icon icon="zi-delete" />
          <div className="text-2xs font-medium">Xoá</div>
        </div>
      </div> */}

      {/* <animated.div
        {...bind()}
        style={{ x }}
        className="bg-white p-4 flex items-center space-x-4 relative"
      > */}
      <div className="bg-white p-4 space-y-3 relative">
        <div className="flex items-center space-x-4">
          <img src={props.product.image} className="w-14 h-14 rounded-lg" />
          <div className="flex-1 space-y-1">
            <div className="text-sm">{props.product.name}</div>
            <div className="flex flex-col">
              <div className="text-sm font-bold">
                {formatPrice(props.unitprice)}
              </div>
              {props.product.originalPrice && (
                <div className="line-through text-subtitle text-4xs">
                  {formatPrice(props.product.originalPrice)}
                </div>
              )}
            </div>
          </div>
          <div>
            <QuantityInput value={cartQuantity} onChange={addToCart} />
          </div>
        </div>
        {props.comboSelections?.length ? (
          <div className="pl-16 space-y-1 text-3xs text-subtitle">
            {props.comboSelections.map((combo, index) => (
              <div
                className="flex items-center justify-between"
                key={`${combo.id}-${index}`}
              >
                <span className="pr-2">{combo.name}</span>
                <div className="flex items-center space-x-2">
                  {combo.extra_price > 0 ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      + {formatPrice(combo.extra_price)}
                    </span>
                  ) : (
                    <span className="text-line"></span>
                  )}
                  <span className="text-primary font-medium">x1</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <div className="pl-16 text-3xs text-subtitle space-y-1">
          <div className="flex items-center justify-between">
            <span className={props.detail ? "text-subtitle" : "text-line"}>
              {props.detail ? `Ghi chú: ${props.detail}` : "Thêm ghi chú"}
            </span>
            <button
              type="button"
              className="p-1 text-primary"
              onClick={() => setIsEditingNote((prev) => !prev)}
            >
              <Icon icon="zi-edit" size={16} />
            </button>
          </div>
          {isEditingNote && (
            <div className="space-y-2">
              <textarea
                className="w-full rounded-lg border border-line bg-white p-2 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                placeholder="Nhập ghi chú cho sản phẩm này"
                value={noteValue}
                onChange={(e) => setNoteValue(e.currentTarget.value)}
              />
              <div className="flex justify-end space-x-2 text-2xs">
                <button
                  type="button"
                  className="px-2 py-1 text-subtitle"
                  onClick={() => {
                    setNoteValue(props.detail ?? "");
                    setIsEditingNote(false);
                  }}
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded-full bg-primary text-white font-medium"
                  onClick={handleNoteSave}
                >
                  Lưu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* </animated.div> */}
      
    </div>
  );
}
