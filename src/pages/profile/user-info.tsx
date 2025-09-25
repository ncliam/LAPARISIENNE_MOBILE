import { UserInfoSkeleton } from "@/components/skeleton";
import { loadableUserInfoState } from "@/state";
import { useAtomValue } from "jotai";
import { PropsWithChildren } from "react";
import Register from "./register";
import { useKyc } from "@/hooks";
import { Button } from "zmp-ui";

function UserInfo({ children }: PropsWithChildren) {
  const userInfo = useAtomValue(loadableUserInfoState);
  const kyc = useKyc();
  if (userInfo.state === "hasData" && userInfo.data) {
    const { name, avatar } = userInfo.data;
    return (
      <>
        <div className="bg-section rounded-lg p-4 flex items-center space-x-4 border-[0.5px] border-black/15">
          <img className="rounded-full h-10 w-10" src={avatar} />
          <div className="space-y-0.5 flex-1 overflow-hidden">
            <div className="text-lg truncate">{name}</div>
          </div>
        </div>
        <Button onClick={async () => {
          await kyc();
        }}
            variant="primary"
            size="medium"
            fullWidth
            className="mt-3">
        Cập nhật chính sách
      </Button>
        {children}
      </>
    );
  }

  if (userInfo.state === "loading") {
    return <UserInfoSkeleton />;
  }

  return <Register />;
}

export default UserInfo;
