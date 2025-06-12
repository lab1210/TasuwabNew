import React from "react";

const Details = ({ supplier }) => {
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(value);

  return (
    <div className="p-6 space-y-6 bg-white rounded-xl shadow-md">
      <div className=" flex justify-between">
        <div>
          <p className="text-gray-500 text-sm">Transaction ID</p>
          <p className="text-lg font-semibold text-gray-800">
            {supplier.transactionId}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Client Name</p>
          <p className="text-lg font-semibold text-gray-800">
            {supplier.clientName}
          </p>
        </div>
      </div>

      {supplier.categories?.map((category) => {
        const categoryTotal = category.products.reduce(
          (sum, p) => sum + p.price * p.quantity,
          0
        );

        return (
          <div
            key={category.id}
            className="bg-gray-50 p-4 rounded-lg shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
              {category.name}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <th className="p-3">Product</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {category.products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-gray-100 transition"
                    >
                      <td className="p-3 text-gray-800">{product.name}</td>
                      <td className="p-3 text-gray-800">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="p-3 text-gray-800">{product.quantity}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-200 font-semibold text-gray-900">
                    <td className="p-3">Total</td>
                    <td className="p-3">{formatCurrency(categoryTotal)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Details;
