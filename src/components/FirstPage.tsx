import BottomRight from "./BottomRight";
import Sidebar from "./Sidebar";
import TopRight from "./TopRight";

export default function FirstPage() {

  return (
    <>
      <Sidebar />
      <div class="flex flex-col w-full space-y-2">
        <TopRight />
        <BottomRight />
      </div>
    </>
  );
}
