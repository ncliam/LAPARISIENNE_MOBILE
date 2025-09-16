import Banners from "./banners";
import Category from "./category";
import Delivery from "../cart/delivery";

const HomePage: React.FunctionComponent = () => {
  return (
    <div className="min-h-full space-y-2 py-2">
      <div className="bg-section">
        <Banners />
      </div>
      <Category />
    </div>
  );
};

export default HomePage;
