export default function TopRight() {
  return (
    <>
      <div class="h-[100px] flex w-full">
        {/* Profile Menu */}
        <div class="profile ml-auto flex place-content-center space-x-2 items-center mr-5">
          <p>Velma Mcmullen</p>
          <div class="avatar">
            <div class="w-10 rounded-full">
              <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
            </div>
          </div>
          <button class="btn btn-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path d="M480-360 280-560h400L480-360Z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
