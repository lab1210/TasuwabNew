// SupplierSelect.jsx or .tsx
import Select from "react-select";
import { useEffect, useState } from "react";
import { getSuppliers } from "@/Services/supplierService";

export default function SupplierSelect({ value, onChange }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const suppliers = getSuppliers();
    const formatted = suppliers.map((s) => ({
      label: s.name,
      value: s.name,
    }));
    setOptions(formatted);
  }, []);

  return (
    <div>
      <label className="font-bold">Supplier</label>
      <Select
        options={options}
        onChange={(selected) =>
          setFormdata({ ...formdata, supplier: selected?.value || "" })
        }
        onInputChange={(inputValue, { action }) => {
          if (action === "input-change") {
            setFormdata({ ...formdata, supplier: inputValue });
          }
        }}
        value={
          formdata.supplier
            ? { label: formdata.supplier, value: formdata.supplier }
            : null
        }
        placeholder="Select or type a supplier"
        isClearable
        isSearchable
        styles={{
          control: (base) => ({
            ...base,
            borderColor: "#ccc",
            boxShadow: "none",
          }),
        }}
      />
    </div>
  );
}
