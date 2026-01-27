import React, { useState } from "react";
import IncomingOrders from "../components/IncomingOrders";
import AcceptedOrders from "../components/AcceptedOrders";
import CollectedOrders from "../components/CollectedOrders";

const MerchantDashboard = () => {
  const [view, setView] = useState("incoming");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
      <div>
        <button
          onClick={() => setView("incoming")}
          className="m-2 p-2 bg-gray-200"
        >
          Incoming Orders
        </button>
        <button
          onClick={() => setView("accepted")}
          className="m-2 p-2 bg-gray-200"
        >
          Accepted Orders
        </button>
        <button
          onClick={() => setView("collected")}
          className="m-2 p-2 bg-gray-200"
        >
          Collected Orders
        </button>
      </div>
      {view === "incoming" && <IncomingOrders />}
      {view === "accepted" && <AcceptedOrders />}
      {view === "collected" && <CollectedOrders />}
    </div>
  );
};

export default MerchantDashboard;
