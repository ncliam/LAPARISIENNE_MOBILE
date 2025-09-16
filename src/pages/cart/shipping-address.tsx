import { shippingAddressState } from "@/state";
import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button, Icon, Input, Switch, Select } from "zmp-ui";
import { useState } from "react";
const { OtpGroup, Option } = Select;

function ShippingAddressPage() {
  const [address, setAddress] = useAtom(shippingAddressState);
  let [formAddress, setFormAddress] = useState(address);

  const resetAddress = useResetAtom(shippingAddressState);
  const navigate = useNavigate();
  
  const deliveryTimeAMOptions = [
    { value: '8:00', label: '8:00 am' },
    { value: '10:00', label: '10:00 am' },
    { value: '12:00', label: '12:00 am' },
  ];

  const deliveryTimePMOptions = [
    { value: '14:00', label: '2:00 pm' },
    { value: '16:00', label: '4:00 pm' },
    { value: '18:00', label: '6:00 pm' },
    { value: '20:00', label: '8:00 pm' },
    { value: '22:00', label: '10:00 pm' },
  ];


  
  return (
    <form
      className="h-full flex flex-col justify-between"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const newAddress = { ...formAddress };

        data.forEach((value, key) => {
          newAddress[key] = value;
        });

        setAddress(newAddress as typeof address);
        toast.success("Đã cập nhật địa chỉ");
        navigate(-1);
      }}
    >
      <div className="py-2 space-y-2">
        <div className="bg-section p-4 grid gap-4">
          <Input
            name="alias"
            label={
              <>
                Tên gợi nhớ <span className="text-danger">*</span>
              </>
            }
            required
            placeholder="Ví dụ: công ty, trường học"
            defaultValue={formAddress?.alias}
          />
          <Input
            name="address"
            label={
              <>
                Địa chỉ <span className="text-danger">*</span>
              </>
            }
            placeholder="Nhập địa chỉ"
            required
            defaultValue={formAddress?.address}
            onInvalid={(e) => {
              e.currentTarget.setCustomValidity("Vui lòng nhập địa chỉ");
              e.currentTarget.reportValidity();
            }}
            onInput={(e) => {
              e.currentTarget.setCustomValidity("");
            }}
          />
        </div>
        <div className="bg-section p-4 grid gap-4">
          <Input
            name="name"
            label={
              <>
                Tên người nhận <span className="text-danger">*</span>
              </>
            }
            required
            placeholder="Nhập tên người nhận"
            defaultValue={formAddress?.name}
          />
          <Input
            name="phone"
            label={
              <>
                Số điện thoại <span className="text-danger">*</span>
              </>
            }
            required
            placeholder="0912345678"
            defaultValue={formAddress?.phone}
          />
          
        </div>
        <div className="bg-section p-4 grid gap-4">
          <Switch
            label="Mang lên tầng"
            checked={formAddress?.toRoom ? true : false }
            onChange={(e) => setFormAddress({ ...formAddress, toRoom: e.target.checked } as unknown as typeof formAddress) }
        />
        </div>
        <div className="bg-section p-4 grid gap-4">
          <Select
            label="Khung giờ giao hàng"
            placeholder="Chọn giờ"
            defaultValue={formAddress?.deliveryAt || ''}
            onChange={(option) => {
              console.log(option);
              const selectedValue = option;
              setFormAddress((prev) => ({
                ...prev,
                deliveryAt: selectedValue,
              }) as typeof formAddress);
            }}
          >
            <Option title='Mọi lúc' value='' />
            <OtpGroup label="Sáng">
            {deliveryTimeAMOptions.map((option) => (
              <Option title={option.value} value={option.value} />
            ))}
            </OtpGroup>

            <OtpGroup label="Chiều">
            {deliveryTimePMOptions.map((option) => (
              <Option title={option.value} value={option.value} />
            ))}
            </OtpGroup>
          </Select>
        </div>
        

        <Button
          fullWidth
          className="!bg-section !text-danger !rounded-none"
          type="danger"
          prefixIcon={<Icon icon="zi-delete" />}
          onClick={() => {
            resetAddress();
            toast.success("Đã xóa địa chỉ");
            navigate(-1);
          }}
        >
          Xóa địa chỉ này
        </Button>
      </div>
      <div className="p-6 pt-4 bg-section">
        <Button htmlType="submit" fullWidth>
          Xong
        </Button>
      </div>
    </form>
  );
}

export default ShippingAddressPage;
