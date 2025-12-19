import HorizontalDivider from "@/components/horizontal-divider";
import { useAtomValue } from "jotai";
import { useParams } from "react-router-dom";
import { productState } from "@/state";
import { formatPrice } from "@/utils/format";
import { ComboState, ComboItem } from "@/types";
import { useAddToCart } from "@/hooks";
import { Button } from "zmp-ui";
import { useState, useMemo } from "react";

export default function ProductComboPage() {
  const { id } = useParams();
  const product = useAtomValue(productState(Number(id)))!;
  const { addToCart } = useAddToCart(product);
  const choices = product.choices ?? [];

  const [state, setState] = useState<ComboState>({
    currentComboIndex: 0,
    selectedCombos: [],
  });

  const isComboCompleted = state.currentComboIndex >= choices.length;
  const currentChoice = !isComboCompleted
    ? choices[state.currentComboIndex]
    : null;
  const totalExtraPrice = useMemo(
    () => state.selectedCombos.reduce((sum, combo) => sum + combo.extra_price, 0),
    [state.selectedCombos]
  );
  const comboTotalPrice = product.price + totalExtraPrice;

  const handleItemSelect = (item: ComboItem) => {
    setState((prev) => {
      if (prev.currentComboIndex >= choices.length) {
        return prev;
      }
      return {
        currentComboIndex: prev.currentComboIndex + 1,
        selectedCombos: [...prev.selectedCombos, item],
      };
    });
  };
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-4 pb-2 space-y-4 bg-section">
          <img
              src={product.image}
              className="w-full aspect-square object-cover rounded-lg"
            />
          <div>
            <div className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-2xs space-x-0.5">
                <span className="text-subtitle line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-danger">
                  -
                  {100 -
                    Math.round((product.price * 100) / product.originalPrice)}
                  %
                </span>
              </div>
            )}
            <div className="text-sm mt-1">{product.name}</div>
          </div>
          </div>
      </div>
      <HorizontalDivider />
      <div className="w-full p-4 pb-2 space-y-2 bg-section border-b border-background">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-primary">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-2xs space-x-1">
                <span className="text-subtitle line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-danger font-medium">
                  -
                  {100 -
                    Math.round((product.price * 100) / product.originalPrice)}
                  %
                </span>
              </div>
            )}
          </div>
          <div className="text-right text-xs text-subtitle flex-1 pl-4">
            {product.name}
          </div>
        </div>
      </div>
      <div className="w-full p-4 pb-2 space-y-4 bg-section">
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          {choices.map((choice, index) => {
            const isCompleted = index < state.currentComboIndex;
            const isActive = index === state.currentComboIndex;
            return (
              <div className="flex items-center" key={`${choice.name}-${index}`}>
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border font-semibold text-2xs ${
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isActive
                      ? "border-primary text-primary"
                      : "border-line text-subtitle"
                  }`}
                >
                  {index + 1}
                </div>
                {index < choices.length - 1 && (
                  <div
                    className={`w-10 h-0.5 mx-3 ${
                      index < state.currentComboIndex ? "bg-primary" : "bg-line"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full p-4 pb-2 space-y-4 bg-section">
        {isComboCompleted && state.selectedCombos.length > 0 ? (
          <div className="space-y-3">
            <h5 className="text-base font-semibold">Bạn đã chọn</h5>
            <div className="space-y-2 text-xs">
              {state.selectedCombos.map((combo, index) => (
                <div
                  className="flex items-center justify-between rounded-lg bg-background px-3 py-2"
                  key={`${combo.id}-${index}`}
                >
                  <div className="flex-1 pr-2">
                    
                    <div className="text-xs font-medium leading-tight">
                      {combo.name}
                    </div>
                  </div>
                  {combo.extra_price > 0 ? (
                    <span className="text-3xs font-semibold whitespace-nowrap px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      + {formatPrice(combo.extra_price)}
                    </span>
                  ) : (
                    <span className="text-3xs text-line font-medium whitespace-nowrap">
                     
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Tổng tiền</span>
              <span>{formatPrice(comboTotalPrice)}</span>
            </div>
            <Button
              fullWidth
              onClick={() =>
                addToCart(1, {
                  toast: true,
                  unitPriceOverride: comboTotalPrice,
                  comboSelections: state.selectedCombos,
                })
              }
            >
              Thêm vào giỏ
            </Button>
          </div>
        ) : (
          currentChoice && (
            <>
              <h5>{currentChoice.name}</h5>
              <div className="grid grid-cols-2 px-4 pt-2 pb-8 gap-4 ">
                {currentChoice.items.map((item) => (
                  <button
                    type="button"
                    onClick={() => handleItemSelect(item)}
                    className="text-left"
                    key={`${item.id}-${item.name}`}
                  >
                    <img
                      src={item.image}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="pt-2 pb-1.5">
                      <div className="pt-1 pb-0.5">
                        <div className="text-xs h-9 line-clamp-2">
                          {item.name}
                        </div>
                      </div>

                      <div className="text-3xs space-x-0.5 truncate">
                        {item.extra_price > 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            + {formatPrice(item.extra_price)}
                          </span>
                        ) : (
                          <span className="text-line">Bao gồm</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
