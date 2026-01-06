import { useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup } from '@/utils/firebase';
import { Button } from 'zmp-ui';
import toast from 'react-hot-toast';
import CONFIG from '@/config';
import { useSetAtom } from 'jotai';
import { userInfoKeyState } from '@/state';
import { useKyc } from '@/hooks';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUserInfoKey = useSetAtom(userInfoKeyState);
  const kyc = useKyc();

  // Get return URL from location state, default to home
  const returnUrl = (location.state as any)?.from || '/';

  // Google Sign-In
  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      toast.error('Firebase chưa được cấu hình');
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Authenticate with backend to get session info
      await kyc();

      // Save to localStorage
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify({
        id: user.uid,
        name: user.displayName || "Anonymous",
        avatar: user.photoURL || CONFIG.DEFAULT_AVATAR,
        phone: user.phoneNumber || "",
        email: user.email || "",
        address: ""
      }));

      // Trigger userInfo state refresh
      setUserInfoKey((key) => key + 1);

      toast.success('Đăng nhập thành công!');
      // Navigate back to return URL
      navigate(returnUrl, { replace: true });
    } catch (error) {
      console.error(error);
      toast.error('Đăng nhập thất bại');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h1>
      {/* Google Sign-In */}
      <Button
        onClick={handleGoogleLogin}
        fullWidth
        variant="primary"
        className="mb-4"
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Đăng nhập bằng Google</span>
        </div>
      </Button>

      <div className="my-6 text-center text-gray-500 relative">
        <span className="bg-white px-4 relative z-10">hoặc</span>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 -z-0"></div>
      </div>

      {/* Phone Sign-In - Coming Soon */}
      <div className="space-y-3 opacity-60">
        <input
          type="tel"
          placeholder="+84 xxx xxx xxx"
          disabled
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
        />
        <Button
          onClick={() => toast('Tính năng đăng nhập bằng số điện thoại sẽ được hỗ trợ sớm', { icon: '🚧' })}
          fullWidth
          variant="secondary"
          disabled
        >
          Gửi mã OTP (Chưa hỗ trợ)
        </Button>
        <p className="text-center text-sm text-gray-500">
          Tính năng đang phát triển
        </p>
      </div>

      <div id="recaptcha-container"></div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Bằng cách đăng nhập, bạn đồng ý với</p>
        <p className="text-primary">Điều khoản sử dụng & Chính sách bảo mật</p>
      </div>
    </div>
  );
}
