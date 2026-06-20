import { useState } from "react";
import castilloLogo from "../../assets/castillo_logo.png";
import { getInventario } from "../../Api/castilloApi";
import { useCachedResource } from "../../hooks/useCachedResource";
import { CACHE_KEYS, invalidateCache } from "../../lib/resourceCache";
import LoadingSpin from "../../components/LoadingSpin";
import { IInventarioResponse } from "../../interfaces/interfaces";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/shadcn/Select";
import { PackageMinus, PackagePlus, Repeat } from "lucide-react";
import { Button } from "../../components/shadcn/Button";
import DarBajaModal from "./DarBajaModal";
import DarEntradaModal from "./DarEntradaModal";
import TransformarModal from "./TransformarModal";

const Inventory = () => {
    const [sortBy, setSortBy] = useState<string>('alphabetical');
    const [showBaja, setShowBaja] = useState(false);
    const [showEntrada, setShowEntrada] = useState(false);
    const [showTransformar, setShowTransformar] = useState(false);

    const { data, loading, error, refetch } = useCachedResource<IInventarioResponse>(
        CACHE_KEYS.inventario,
        () => getInventario(),
        { ttl: 120_000 }
    );

    // Tras una entrada/baja/transformación cambia el inventario y, además, el
    // capital y el patrimonio (entrada resta capital, baja suma parte pagada).
    // Recargamos el inventario e invalidamos los otros para que se refresquen.
    const recargarTrasMutacion = () => {
        invalidateCache(CACHE_KEYS.capital);
        invalidateCache(CACHE_KEYS.patrimonio);
        invalidateCache(CACHE_KEYS.patrimonioHistorial);
        refetch();
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("es-MX", {
            currency: "MXN",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.floor(amount)) + " cup";

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
        <div className="w-full min-h-screen p-4 lg:p-8">
            {/* Logo */}
            <div className="w-full mx-auto flex justify-center items-center mb-8">
                <img
                    src={castilloLogo}
                    className="w-48 sm:w-64 md:w-80"
                    alt="Castillo Logo"
                />
            </div>

            <div className="w-full max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-amber-50">
                        Inventario general
                    </h2>
                    <div className="flex flex-wrap gap-2.5 w-fit">
                        <Button
                            onClick={() => setShowTransformar(true)}
                            className="h-10 gap-2 rounded-lg border border-sky-400/30 bg-sky-400/10 px-4 text-sky-100 transition-colors hover:border-sky-400/50 hover:bg-sky-400/20 hover:text-white"
                        >
                            <Repeat className="size-4" />
                            Transformar
                        </Button>
                        <Button
                            onClick={() => setShowEntrada(true)}
                            className="h-10 gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 text-emerald-100 transition-colors hover:border-emerald-400/50 hover:bg-emerald-400/20 hover:text-white"
                        >
                            <PackagePlus className="size-4" />
                            Dar entrada
                        </Button>
                        <Button
                            onClick={() => setShowBaja(true)}
                            className="h-10 gap-2 rounded-lg bg-orange-500 px-4 text-white shadow-lg shadow-orange-900/30 transition-colors hover:bg-orange-600"
                        >
                            <PackageMinus className="size-4" />
                            Dar baja
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpin />
                    </div>
                ) : !data && error ? (
                    <p className="text-red-500 p-4">No se pudo cargar el inventario.</p>
                ) : data && (
                    <div className="space-y-8">
                        {/* Stats Section */}
                        <div>
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-amber-50 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <span>Productos procesados</span>
                                <span className="text-base sm:text-lg font-thin">
                                    {data.cantidadProductos}
                                </span>
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                                <div className="flex flex-col gap-2 border-l-2 border-stone-50 pl-4 py-2">
                                    <dt className="text-sm text-amber-100">
                                        Cantidad de productos
                                    </dt>
                                    <dd className="text-2xl sm:text-3xl md:text-4xl font-semibold text-amber-50">
                                        {data.cantidadTotalEnInventario.toFixed(2)}
                                    </dd>
                                </div>

                                <div className="flex flex-col gap-2 border-l-2 border-orange-400 pl-4 py-2">
                                    <dt className="text-sm text-orange-400">
                                        Total invertido
                                    </dt>
                                    <dd className="text-2xl sm:text-3xl md:text-4xl font-semibold text-orange-400">
                                        {formatCurrency(+data.totalInvertido)}
                                    </dd>
                                </div>
                            </div>
                        </div>

                        {/* Products Table/Cards */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-white/10">
                                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
                                    Productos en Inventario
                                </h3>

                                {/* Sort Selector */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <span className="text-gray-300 text-sm">Ordenar por:</span>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-full sm:w-[220px] bg-white/10 border-white/20 text-white hover:bg-white/20 focus:ring-amber-500 focus:border-amber-500">
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

                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-6 text-gray-300 font-medium">
                                                No
                                            </th>
                                            <th className="text-left py-4 px-6 text-gray-300 font-medium">
                                                Nombre del Producto
                                            </th>
                                            <th className="text-right py-4 px-6 text-gray-300 font-medium">
                                                Cantidad
                                            </th>
                                            <th className="text-right py-4 px-6 text-gray-300 font-medium">
                                                Invertido
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedProducts.map((product, index) => (
                                            <tr
                                                key={product.id}
                                                className={`border-b border-white/5 hover:bg-white/5 transition-colors duration-200 ${
                                                    index % 2 === 0 ? "bg-white/[0.02]" : ""
                                                }`}
                                            >
                                                <td className="py-4 px-6 text-white">
                                                    <div className="font-thin">{index + 1}</div>
                                                </td>
                                                <td className="py-4 px-6 text-white">
                                                    <div className="font-medium">
                                                        {product.item_name}
                                                    </div>
                                                    {product.description && (
                                                        <div className="text-gray-400 text-sm mt-1">
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

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-white/5">
                                {sortedProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="p-4 hover:bg-white/5 transition-colors duration-200"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-gray-400 text-xs">
                                                        #{index + 1}
                                                    </span>
                                                    <h4 className="text-white font-medium">
                                                        {product.item_name}
                                                    </h4>
                                                </div>
                                                {product.description && (
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 mt-3">
                                            <div>
                                                <div className="text-gray-400 text-xs mb-1">
                                                    Cantidad
                                                </div>
                                                <div className="text-white font-semibold">
                                                    {product.quantity} u
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-gray-400 text-xs mb-1">
                                                    Invertido
                                                </div>
                                                <div className="text-white font-semibold">
                                                    {product.quantity * product.cost}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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

            {showBaja && (
                <DarBajaModal
                    productos={data?.productosConInventario ?? []}
                    onClose={() => setShowBaja(false)}
                    onDone={() => {
                        setShowBaja(false);
                        recargarTrasMutacion();
                    }}
                />
            )}

            {showEntrada && (
                <DarEntradaModal
                    productos={data?.productosConInventario ?? []}
                    onClose={() => setShowEntrada(false)}
                    onDone={() => {
                        setShowEntrada(false);
                        recargarTrasMutacion();
                    }}
                />
            )}

            {showTransformar && (
                <TransformarModal
                    productos={data?.productosConInventario ?? []}
                    onClose={() => setShowTransformar(false)}
                    onDone={() => {
                        setShowTransformar(false);
                        recargarTrasMutacion();
                    }}
                />
            )}
        </div>
    );
};

export default Inventory;