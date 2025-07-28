import { useEffect, useState } from "react";
import castilloLogo from "../../assets/castillo_logo.png";
import { getInventario } from "../../Api/castilloApi";
import LoadingSpin from "../../components/LoadingSpin";
import { IInventarioResponse } from "../../interfaces/interfaces";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/shadcn/Select";

const Inventory = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<IInventarioResponse | null>(null);
    const [sortBy, setSortBy] = useState<string>('alphabetical');

    useEffect(() => {
        const loadInventory = async () => {
            try {
                const data = await getInventario();
                if (data) {
                    setData(data);
                }
            } catch (error) {
                console.error("Error cargando ventas:", error);
                setError(JSON.stringify(error));
            } finally {
                setLoading(false);
            }
        };
        loadInventory();
    }, []);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("es-MX", {
            currency: "MXN",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.floor(amount)) + " cup";

    // Función para ordenar productos según la opción seleccionada
    const getSortedProducts = () => {
        if (!data?.productosConInventario) return [];

        const products = [...data.productosConInventario];

        if (sortBy === 'alphabetical') {
            return products.sort((a, b) => a.item_name.localeCompare(b.item_name));
        } else if (sortBy === 'quantity') {
            return products.sort((a, b) => a.quantity - b.quantity);
        } else if (sortBy === 'totalValue') {
            return products.sort((a, b) => (a.quantity * a.cost) - (b.quantity * b.cost));
        }
        return products;
    };

    const sortedProducts = getSortedProducts();
    return (
        <div className="w-full h-full p-2 lg:p-8">
            <div className="w-full mx-auto flex justify-center items-center">
                <img
                    src={castilloLogo}
                    className="w-2/3 md:w-1/3"
                    alt="Castillo Logo"
                />
            </div>

            <div className="w-full flex flex-col justify-center items-center py-24 sm:py-32">
                <div className="flex flex-col">
                    <div>
                        <div className="mb-6 grid gap-2 md:gap-6">
                            <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl flex flex-col">
                                Inventario general
                            </h2>


                        </div>
                        {loading ? (
                            <LoadingSpin />
                        ) : (
                            data !== null && (
                                <div>
                                    {error ? (
                                        <p className="text-red-500">{error}</p>
                                    ) : (
                                        <div className="mx-auto max-w-7xl lg:px-8 mt-12">
                                            <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mt-14 mb-6 flex justify-between items-center">
                                                Productos procesados{" "}
                                                <span className="sm:text-md font-thin">
                                                    {data?.cantidadProductos}
                                                </span>
                                            </h2>
                                            <dl className="grid grid-cols-4 gap-8  lg:grid-cols-4">
                                                <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                                                    <dt className="text-base/7 text-amber-100">
                                                        Cantidad de productos
                                                    </dt>
                                                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                                                        {data?.cantidadTotalEnInventario.toFixed(2)}
                                                    </dd>
                                                </div>

                                                <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                                                    <dt className="text-base/7 text-orange-400">
                                                        Total invertido
                                                    </dt>
                                                    <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                                                        {formatCurrency(+data?.totalInvertido)}
                                                    </dd>
                                                </div>
                                            </dl>

                                            {/* Tabla de productos */}
                                            <div className="bg-white/1 backdrop-blur-xs border border-none rounded-xl overflow-hidden mt-12">
                                                <div className="p-6 border-b border-white/10">
                                                    <h2 className="text-xl font-semibold text-white">
                                                        Productos en Inventario
                                                    </h2>

                                                    {/* Selector de ordenamiento con shadcn/ui Select */}
                                                    <div className="flex items-center space-x-3 mt-4">
                                                        <span className="text-gray-300 text-sm">Ordenar por:</span>
                                                        <Select value={sortBy} onValueChange={setSortBy}>
                                                            <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white hover:bg-white/20 focus:ring-amber-500 focus:border-amber-500">
                                                                <SelectValue placeholder="Seleccionar orden" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-gray-800 border-white/20">
                                                                <SelectItem
                                                                    value="alphabetical"
                                                                    className="text-white hover:bg-white/10 focus:bg-white/10"
                                                                >
                                                                    Orden alfabético
                                                                </SelectItem>
                                                                <SelectItem
                                                                    value="quantity"
                                                                    className="text-white hover:bg-white/10 focus:bg-white/10"
                                                                >
                                                                    Cantidad (menor a mayor)
                                                                </SelectItem>
                                                                <SelectItem
                                                                    value="totalValue"
                                                                    className="text-white hover:bg-white/10 focus:bg-white/10"
                                                                >
                                                                    Valor total (menor a mayor)
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="border-b border-white/10">
                                                                <th className="text-left py-4 px-6 text-gray-300 font-medium ">
                                                                    No
                                                                </th>
                                                                <th className="text-left py-4 px-6 text-gray-300 font-medium ">
                                                                    Nombre del Producto
                                                                </th>
                                                                <th className="text-right py-4 px-6 text-gray-300 font-medium ">
                                                                    Cantidad
                                                                </th>
                                                                <th className="text-right py-4 px-6 text-gray-300 font-medium ">
                                                                    Invertido
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {sortedProducts.map((product, index) => (
                                                                <tr
                                                                    key={product.id}
                                                                    className={`border-b border-white/5 hover:bg-white/5 transition-colors duration-200 ${index % 2 === 0 ? "bg-white/[0.02]" : ""
                                                                        }`}
                                                                >
                                                                    <td className="py-4 px-6 text-white">
                                                                        <div className="font-thin">
                                                                            {index + 1}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-6 text-white">
                                                                        <div className="font-medium">
                                                                            {product.item_name}
                                                                        </div>
                                                                        {product.description && (
                                                                            <div className="text-gray-400 mt-1">
                                                                                {product.description}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-right">
                                                                        <span className="text-white font-semibold">
                                                                            {product.quantity} u
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 px-6 text-right">
                                                                        <span className="text-white font-semibold">
                                                                            {product.quantity * product.cost}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {sortedProducts.length === 0 && (
                                                    <div className="p-12 text-center">
                                                        <div className="text-gray-400 text-lg">
                                                            No hay productos en inventario
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
