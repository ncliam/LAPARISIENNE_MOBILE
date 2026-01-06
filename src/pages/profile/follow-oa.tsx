import { useEffect } from "react";
import { showOAWidget } from "zmp-sdk";
import { isZalo } from "@/utils/platform";

export default function FollowOAWidget() {
  // Only show in Zalo mode
  if (!isZalo()) {
    return null;
  }

  useEffect(() => {
    showOAWidget({
      id: "oaWidget",
      guidingText: "Quan tâm OA để nhận các đặc quyền ưu đãi",
      color: "#F7F7F8",
    });
  }, []);

  return <div id="oaWidget" />;
}
