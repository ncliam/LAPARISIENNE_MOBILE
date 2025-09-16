import {
  userInfoState
} from "@/state";
import { useAtomValue } from "jotai";
import QRcode from "react-qr-code";
import barcodeIllusLeft from "@/static/barcode-illus-left.svg";
import barcodeIllusRight from "@/static/barcode-illus-right.svg";

export default function Points() {
  const userInfo = useAtomValue(userInfoState);
  return (
    <div
      className="rounded-lg bg-primary text-white p-8 pt-6 bg-cover text-center"
      style={{
        backgroundImage: `url(${barcodeIllusLeft}), url(${barcodeIllusRight})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top left, bottom right",
        backgroundSize: "auto, auto",
      }}
    >
      <div className="bg-white rounded-lg mt-2 py-2.5 space-y-2.5 flex flex-col items-center">
        <div className="text-2xs text-subtitle text-center">
          Mã thành viên
        </div>
        <QRcode value={userInfo?.id} />
      </div>
    </div>
  );
}
