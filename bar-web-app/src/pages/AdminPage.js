import React, { useState } from "react";
import DrinkList from "../components/DrinkList";
import AddDrinkForm from "../components/AddDrinkForm";
import OrderList from "../components/OrderList";
import ManageOrder from "../components/ManageOrder";
import MerchantOnboarding from "../components/MerchantOnboarding";
import Login from "../components/Login";
import AcceptOrder from "../components/AcceptOrder";
import MarkOrderReady from "../components/MarkOrderReady";
import CollectOrder from "../components/CollectOrder";
import NewInventory from "../components/NewInventory";
import ModifyInventory from "../components/ModifyInventory";
import Logout from "../components/Logout";
import ViewUsers from "../components/ViewUsers";

const AdminPage = () => {
  const [view, setView] = useState("dashboard");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div>
        <button
          onClick={() => setView("dashboard")}
          className="m-2 p-2 bg-gray-200"
        >
          Dashboard
        </button>
        <button
          onClick={() => setView("admin")}
          className="m-2 p-2 bg-gray-200"
        >
          Admin Config
        </button>
        <button
          onClick={() => setView("onboarding")}
          className="m-2 p-2 bg-gray-200"
        >
          Merchant Onboarding
        </button>
        <button
          onClick={() => setView("loginMerchant")}
          className="m-2 p-2 bg-gray-200"
        >
          Login as Merchant
        </button>
        <button
          onClick={() => setView("loginAdmin")}
          className="m-2 p-2 bg-gray-200"
        >
          Login as Admin
        </button>
        <button
          onClick={() => setView("acceptOrder")}
          className="m-2 p-2 bg-gray-200"
        >
          Accept Order
        </button>
        <button
          onClick={() => setView("markReady")}
          className="m-2 p-2 bg-gray-200"
        >
          Mark Order as Ready
        </button>
        <button
          onClick={() => setView("collectOrder")}
          className="m-2 p-2 bg-gray-200"
        >
          Collect Order
        </button>
        <button
          onClick={() => setView("newInventory")}
          className="m-2 p-2 bg-gray-200"
        >
          Add New Inventory
        </button>
        <button
          onClick={() => setView("increaseInventory")}
          className="m-2 p-2 bg-gray-200"
        >
          Increase Inventory
        </button>
        <button
          onClick={() => setView("decreaseInventory")}
          className="m-2 p-2 bg-gray-200"
        >
          Decrease Inventory
        </button>
        <button
          onClick={() => setView("logout")}
          className="m-2 p-2 bg-gray-200"
        >
          Logout
        </button>
        <button
          onClick={() => setView("viewCustomers")}
          className="m-2 p-2 bg-gray-200"
        >
          View Customers
        </button>
        <button
          onClick={() => setView("viewMerchants")}
          className="m-2 p-2 bg-gray-200"
        >
          View Merchants
        </button>
      </div>
      {view === "dashboard" && (
        <>
          <h2 className="text-xl font-bold">Merchant Dashboard</h2>
          <ManageOrder />
          <OrderList />
        </>
      )}
      {view === "admin" && (
        <>
          <h2 className="text-xl font-bold">Admin Configuration</h2>
          <AddDrinkForm />
          <DrinkList />
        </>
      )}
      {view === "onboarding" && (
        <>
          <h2 className="text-xl font-bold">Merchant Onboarding</h2>
          <MerchantOnboarding />
        </>
      )}
      {view === "loginMerchant" && (
        <>
          <h2 className="text-xl font-bold">Login as Merchant</h2>
          <Login role="M" />
        </>
      )}
      {view === "loginAdmin" && (
        <>
          <h2 className="text-xl font-bold">Login as Admin</h2>
          <Login role="SA" />
        </>
      )}
      {view === "acceptOrder" && (
        <>
          <h2 className="text-xl font-bold">Accept Order</h2>
          <AcceptOrder />
        </>
      )}
      {view === "markReady" && (
        <>
          <h2 className="text-xl font-bold">Mark Order as Ready</h2>
          <MarkOrderReady />
        </>
      )}
      {view === "collectOrder" && (
        <>
          <h2 className="text-xl font-bold">Collect Order</h2>
          <CollectOrder />
        </>
      )}
      {view === "newInventory" && (
        <>
          <h2 className="text-xl font-bold">Add New Inventory</h2>
          <NewInventory />
        </>
      )}
      {view === "increaseInventory" && (
        <>
          <h2 className="text-xl font-bold">Increase Inventory</h2>
          <ModifyInventory type="increase" />
        </>
      )}
      {view === "decreaseInventory" && (
        <>
          <h2 className="text-xl font-bold">Decrease Inventory</h2>
          <ModifyInventory type="decrease" />
        </>
      )}
      {view === "logout" && (
        <>
          <h2 className="text-xl font-bold">Logout</h2>
          <Logout />
        </>
      )}
      {view === "viewCustomers" && (
        <>
          <h2 className="text-xl font-bold">View Customers</h2>
          <ViewUsers type="customers" />
        </>
      )}
      {view === "viewMerchants" && (
        <>
          <h2 className="text-xl font-bold">View Merchants</h2>
          <ViewUsers type="merchants" />
        </>
      )}
    </div>
  );
};

export default AdminPage;
