import { IoSearchOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";

const SideMenu = ({ cars, focusCar }) => {
  console.log("cars in side menu:", cars);
  
  return (
    <aside className="w-96 h-[90%] absolute top-1/2 left-8 -translate-y-1/2 z-10">
      <div className="bg-white h-full w-full rounded-2xl shadow-lg p-4 flex flex-col space-y-4">
        <div className="flex items-center rounded-xl bg-mainColor/10 p-2">
          <div className="relative group">
            <p className="flex items-center gap-1 text-lg cursor-pointer text-mainColor">
              Device <MdKeyboardArrowDown />
            </p>
            <div className="absolute top[calc(100% + 30px)] left-0 bg-white shadow-lg rounded-lg p-2 flex-col gap-1 hidden group-hover:flex">
              <span className="p-2 hover:bg-mainColor/10 cursor-pointer">
                Device
              </span>
              <span className="p-2 hover:bg-mainColor/10 cursor-pointer">
                Customer
              </span>
            </div>
          </div>

          <input
            type="text"
            placeholder="name/IMEI"
            className="flex-1 px-2 py-1 border-none outline-none text-lg bg-transparent placeholder:text-gray-400"
          />

          <span className="text-2xl text-mainColor p-2 cursor-pointer">
            <IoSearchOutline />
          </span>
        </div>

        <div className="bg-mainColor/10 p-2 rounded-xl flex">
          <button className="p-2 flex-1 text-lg text-gray-600 rounded-lg hover:bg-mainColor/10 hover:text-mainColor">
            All (100)
          </button>
          <button className="p-2 flex-1 text-lg text-gray-600 rounded-lg hover:bg-mainColor/10 hover:text-mainColor">
            online (30)
          </button>
          <button className="p-2 flex-1 text-lg text-gray-600 rounded-lg hover:bg-mainColor/10 hover:text-mainColor">
            offline (70)
          </button>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
          {cars?.map((car) => (
            <div
              key={car.id}
              onClick={() => focusCar(car)}
              className="flex items-center justify-between gap-1 p-2 cursor-pointer hover:bg-gray-400/10 rounded-lg"
            >
              <span>{car.name}</span>
              <span>{car.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SideMenu;
