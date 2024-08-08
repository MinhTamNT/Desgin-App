import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

export const Home = () => {
  const user = useSelector((state: RootState) => state?.user?.user);
  console.log({ user });

  return <div>Home</div>;
};
