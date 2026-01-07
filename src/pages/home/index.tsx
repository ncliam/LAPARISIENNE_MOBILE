import Banners from "./banners";
import Category from "./category";

const HomePage: React.FunctionComponent = () => {
  return (
    <div className="min-h-full space-y-2 py-2">
      <div className="md:max-w-screen-xl md:mx-auto">
        <Category />
        <div className="bg-section">
          <Banners />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
