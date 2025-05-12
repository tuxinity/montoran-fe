import { MainLayoutClient } from "./main-layout-client";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return <MainLayoutClient>{children}</MainLayoutClient>;
};

export default MainLayout;
