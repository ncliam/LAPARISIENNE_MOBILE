import {
  sessionState
} from "@/state";
import { useAtomValue } from "jotai";
import QRcode from "react-qr-code";
import barcodeIllusLeft from "@/static/barcode-illus-left.svg";
import barcodeIllusRight from "@/static/barcode-illus-right.svg";
import { useKyc } from "@/hooks";
import { Button } from "zmp-ui";

export default function Points() {
  const sessionInfo = useAtomValue(sessionState);
  const kyc = useKyc();

  return (
    <div>
      {<div
        className="rounded-lg bg-primary text-white p-8 pt-6 bg-cover text-center"
        style={{
          backgroundImage: `url(${barcodeIllusLeft}), url(${barcodeIllusRight})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top left, bottom right",
          backgroundSize: "auto, auto",
        }}
      >
        <div className="bg-white rounded-lg mt-2 py-2.5 space-y-2.5 flex flex-col items-center">
          {!sessionInfo && (
                <div className="text-2xs text-subtitle text-center">
                  <QRcode value='unknown' fgColor="#cccc" />
                  <div className="mt-3">
                    Giá niêm yết
                  </div>
                </div>
            )}
          {sessionInfo && (
                <div className="text-2xs text-subtitle text-center">
                  <QRcode value={sessionInfo?.ref || sessionInfo?.customer_phone } />
                  <div className="mt-3">
                    {sessionInfo?.property_product_pricelist[1] || 'Giá niêm yết'} 
                  </div>
                </div>
                
            )}
          <Button onClick={async () => {
            await kyc();
          }}
              size="small">
          Cập nhật chính sách
        </Button>
        </div>
      </div>
      }
      
    </div>
    
  );
}
