import { UserInfoSkeleton } from "@/components/skeleton";
import { loadableUserInfoState, sessionState } from "@/state";
import { useAtomValue } from "jotai";
import { PropsWithChildren } from "react";
import Register from "./register";
import { useLogout } from "@/hooks";
import { isZalo } from "@/utils/platform";
import { Icon } from "zmp-ui";
import CONFIG from "@/config";

function UserInfo({ children }: PropsWithChildren) {
  const userInfo = useAtomValue(loadableUserInfoState);
  const sessionInfo = useAtomValue(sessionState);
  const logout = useLogout();
  if (userInfo.state === "hasData" && userInfo.data) {
    const { name, avatar } = userInfo.data;
    return (
      <>
        <div className="bg-section rounded-lg p-4 flex items-center space-x-4 border-[0.5px] border-black/15">
          <img
            className="rounded-full h-10 w-10"
            src={avatar}
            onError={(e) => {
              // Fallback to default avatar if Google image fails (429 error)
              e.currentTarget.src = CONFIG.DEFAULT_AVATAR;
            }}
            alt={name}
          />
          <div className="space-y-0.5 flex-1 overflow-hidden">
            <div className="text-lg truncate">
              {name}<br/>
              {sessionInfo?.customer_phone || ''}
            </div>
          </div>
          {!isZalo() && (
            <button
              onClick={logout}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Icon icon="zi-close-circle" size={18} />
              <span>Đăng xuất</span>
            </button>
          )}
        </div>
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
