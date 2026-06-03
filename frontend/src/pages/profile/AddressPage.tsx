import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit3, Save, X, RefreshCw, CheckCircle, Home, Briefcase, Globe, Info } from 'lucide-react';

interface Address {
    addressId?: number;
    loginUserId?: number;
    addressCd: number;
    addressUsageCd: number;
    countryCd: number;
    stateCd: number;
    addressLine1: string;
    addressLine2: string;
    cityTown: string;
    postalCode: string;
    district: string;
    countryDescription?: string;
    stateDescription?: string;
    addressTypeDescription?: string;
    addressUsageDescription?: string;
}

interface LookupOption {
    codeCd: number;
    description: string;
}

export default function AddressPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Lookups
    const [countries, setCountries] = useState<LookupOption[]>([]);
    const [states, setStates] = useState<LookupOption[]>([]);
    const [types, setTypes] = useState<LookupOption[]>([]);
    const [usages, setUsages] = useState<LookupOption[]>([]);

    // Form states
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null); // -1 for adding, addressId for modifying

    // Form fields
    const [addressCd, setAddressCd] = useState<number>(1);
    const [addressUsageCd, setAddressUsageCd] = useState<number>(1);
    const [countryCd, setCountryCd] = useState<number>(1);
    const [stateCd, setStateCd] = useState<number>(1);
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [cityTown, setCityTown] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [district, setDistrict] = useState('');

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await fetch('/address');
            if (!response.ok) throw new Error('Failed to retrieve addresses');
            const data = await response.json();
            setAddresses(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchLookups = async () => {
        try {
            // Load Countries
            const resCountries = await fetch('/lookup/country', { cache: 'no-store' });
            if (resCountries.ok) {
                const data = await resCountries.json();
                setCountries(data);
            } else {
                throw new Error('Failed to load countries');
            }

            // Load States
            const resStates = await fetch('/lookup/state', { cache: 'no-store' });
            if (resStates.ok) {
                const data = await resStates.json();
                setStates(data);
            } else {
                throw new Error('Failed to load states');
            }

            // Load Types
            const resTypes = await fetch('/lookup/address', { cache: 'no-store' });
            if (resTypes.ok) {
                const data = await resTypes.json();
                setTypes(data);
            } else {
                throw new Error('Failed to load address types');
            }

            // Load Usages
            const resUsages = await fetch('/lookup/address_usage', { cache: 'no-store' });
            if (resUsages.ok) {
                const data = await resUsages.json();
                setUsages(data);
            } else {
                throw new Error('Failed to load address usages');
            }
        } catch (err) {
            throw new Error('Failed to load lookups');
        }
    };

    useEffect(() => {
        fetchAddresses();
        fetchLookups();
    }, []);

    const triggerSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(-1);
        try {
            const payload: Address = {
                addressCd,
                addressUsageCd,
                countryCd,
                stateCd,
                addressLine1,
                addressLine2,
                cityTown,
                postalCode,
                district
            };

            const response = await fetch('/address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to add address');
            }

            // Reset form
            setAddressLine1('');
            setAddressLine2('');
            setCityTown('');
            setPostalCode('');
            setDistrict('');
            setIsAdding(false);

            triggerSuccess('New address successfully added to registry');
            await fetchAddresses();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdate = async (addressId: number) => {
        setActionLoading(addressId);
        try {
            const payload: Address = {
                addressCd,
                addressUsageCd,
                countryCd,
                stateCd,
                addressLine1,
                addressLine2,
                cityTown,
                postalCode,
                district
            };

            const response = await fetch(`/address/${addressId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to update address');
            }

            setEditingId(null);
            triggerSuccess('Address successfully updated');
            await fetchAddresses();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (addressId: number) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        setActionLoading(addressId);
        try {
            const response = await fetch(`/address/${addressId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete address');
            triggerSuccess('Address detached successfully');
            await fetchAddresses();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const startEditing = (address: Address) => {
        setEditingId(address.addressId || null);
        setAddressCd(address.addressCd);
        setAddressUsageCd(address.addressUsageCd);
        setCountryCd(address.countryCd);
        setStateCd(address.stateCd);
        setAddressLine1(address.addressLine1);
        setAddressLine2(address.addressLine2 || '');
        setCityTown(address.cityTown);
        setPostalCode(address.postalCode);
        setDistrict(address.district || '');
    };

    // Helper to get description from lookups
    const getLookupDesc = (list: LookupOption[], codeCd: number, fallback: string) => {
        return list.find(o => o.codeCd === codeCd)?.description || fallback || 'Not Specified';
    };

    if (loading && addresses.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-24 text-center shadow-xl shadow-slate-200/40 animate-fade-in">
                <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs mt-8">Retrieving Registered Physical Addresses...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Success Alert Toast */}
            {successMessage && (
                <div className="fixed bottom-6 right-6 z-50 p-4.5 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-slide-in-right">
                    <div className="p-1.5 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-black tracking-tight">{successMessage}</span>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-red-700 flex items-start gap-4 shadow-sm animate-fade-in">
                    <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-black tracking-tight">An error occurred</p>
                        <p className="text-[11px] font-semibold text-red-600 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 relative">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-black text-slate-900 tracking-tight">Physical Addresses</h1>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug truncate">
                            Configure billing, residential, shipping and company branch addresses.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAdding(!isAdding);
                            setEditingId(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shrink-0 ${isAdding ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'}`}
                    >
                        {isAdding ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add Address</>}
                    </button>
                </div>
            </div>

            {/* Address Management Form */}
            {isAdding && (
                <div className="bg-white rounded-[2rem] border border-indigo-100 p-8 shadow-2xl shadow-indigo-500/5 animate-slide-up">
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Plus className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-black text-slate-800 tracking-tight">New Physical Address</h3>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Type */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Classification</label>
                                <select
                                    value={addressCd}
                                    onChange={(e) => setAddressCd(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                >
                                    {types.map(t => <option key={t.codeCd} value={t.codeCd}>{t.description}</option>)}
                                </select>
                            </div>

                            {/* Usage */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Intended Usage</label>
                                <select
                                    value={addressUsageCd}
                                    onChange={(e) => setAddressUsageCd(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                >
                                    {usages.map(u => <option key={u.codeCd} value={u.codeCd}>{u.description}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Address Lines */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Line 1</label>
                                <input
                                    type="text"
                                    required
                                    value={addressLine1}
                                    onChange={(e) => setAddressLine1(e.target.value)}
                                    placeholder="House/Apartment/Suite number, street name"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    value={addressLine2}
                                    onChange={(e) => setAddressLine2(e.target.value)}
                                    placeholder="Building name, landmark, nearby area"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                />
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">City / Town</label>
                                <input
                                    type="text"
                                    required
                                    value={cityTown}
                                    onChange={(e) => setCityTown(e.target.value)}
                                    placeholder="Enter city..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">District / Region</label>
                                <input
                                    type="text"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    placeholder="Enter district..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Postal Code (ZIP)</label>
                                <input
                                    type="text"
                                    required
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    placeholder="Enter postal code..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                />
                            </div>
                        </div>

                        {/* Country and State */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                                <select
                                    value={countryCd}
                                    onChange={(e) => setCountryCd(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                >
                                    {countries.map(c => <option key={c.codeCd} value={c.codeCd}>{c.description}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">State / Province</label>
                                <select
                                    value={stateCd}
                                    onChange={(e) => setStateCd(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                >
                                    {states.map(s => <option key={s.codeCd} value={s.codeCd}>{s.description}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={actionLoading === -1}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-100"
                            >
                                {actionLoading === -1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Address to Profile</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Address Display Grid */}
            <div className="grid gap-6">
                {addresses.map((address) => {
                    const isEditingThis = editingId === address.addressId;

                    return (
                        <div
                            key={address.addressId}
                            className={`bg-white rounded-[2rem] border transition-all p-8 relative overflow-hidden group ${isEditingThis ? 'border-indigo-500 shadow-2xl shadow-indigo-100' : 'border-slate-200 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5'}`}
                        >
                            {/* Accent indicator */}
                            <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-indigo-600 to-violet-600 opacity-80" />

                            {isEditingThis ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-2">
                                            <Edit3 className="w-4 h-4 text-indigo-600" />
                                            <h3 className="text-sm font-black text-slate-800 tracking-tight">Edit Physical Address</h3>
                                        </div>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Classification</label>
                                            <select
                                                value={addressCd}
                                                onChange={(e) => setAddressCd(Number(e.target.value))}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            >
                                                {types.map(t => <option key={t.codeCd} value={t.codeCd}>{t.description}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Intended Usage</label>
                                            <select
                                                value={addressUsageCd}
                                                onChange={(e) => setAddressUsageCd(Number(e.target.value))}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            >
                                                {usages.map(u => <option key={u.codeCd} value={u.codeCd}>{u.description}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Line 1</label>
                                            <input
                                                type="text"
                                                required
                                                value={addressLine1}
                                                onChange={(e) => setAddressLine1(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Line 2 (Optional)</label>
                                            <input
                                                type="text"
                                                value={addressLine2}
                                                onChange={(e) => setAddressLine2(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">City / Town</label>
                                            <input
                                                type="text"
                                                required
                                                value={cityTown}
                                                onChange={(e) => setCityTown(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">District / Region</label>
                                            <input
                                                type="text"
                                                value={district}
                                                onChange={(e) => setDistrict(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Postal Code (ZIP)</label>
                                            <input
                                                type="text"
                                                required
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                                            <select
                                                value={countryCd}
                                                onChange={(e) => setCountryCd(Number(e.target.value))}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            >
                                                {countries.map(c => <option key={c.codeCd} value={c.codeCd}>{c.description}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">State / Province</label>
                                            <select
                                                value={stateCd}
                                                onChange={(e) => setStateCd(Number(e.target.value))}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            >
                                                {states.map(s => <option key={s.codeCd} value={s.codeCd}>{s.description}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => handleUpdate(address.addressId!)}
                                            disabled={actionLoading === address.addressId}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {actionLoading === address.addressId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Details</>}
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-4">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Classification badge */}
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-indigo-100 shadow-sm select-none">
                                                <Home className="w-3 h-3 text-indigo-500 shrink-0" />
                                                {getLookupDesc(types, address.addressCd, address.addressTypeDescription || 'Address')}
                                            </span>

                                            {/* Intended Usage badge */}
                                            <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-violet-100 shadow-sm select-none">
                                                <Briefcase className="w-3 h-3 text-violet-500 shrink-0" />
                                                {getLookupDesc(usages, address.addressUsageCd, address.addressUsageDescription || 'Personal')}
                                            </span>
                                        </div>

                                        {/* Physical Address Details */}
                                        <div className="space-y-1">
                                            <h3 className="text-base font-bold text-slate-800 leading-normal">{address.addressLine1}</h3>
                                            {address.addressLine2 && <p className="text-sm font-semibold text-slate-500">{address.addressLine2}</p>}
                                            <p className="text-sm font-black text-slate-700 mt-2">
                                                {address.cityTown}
                                                {address.district && `, ${address.district}`}
                                                {`, ${address.postalCode}`}
                                            </p>
                                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 pt-1">
                                                <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                {getLookupDesc(states, address.stateCd, address.stateDescription || '')}
                                                {', '}
                                                {getLookupDesc(countries, address.countryCd, address.countryDescription || '')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 self-end md:self-start shrink-0">
                                        <button
                                            onClick={() => startEditing(address)}
                                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center shadow-sm"
                                            title="Edit Address"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.addressId!)}
                                            disabled={actionLoading === address.addressId}
                                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
                                            title="Delete Address"
                                        >
                                            {actionLoading === address.addressId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {addresses.length === 0 && !loading && (
                    <div className="bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 p-16 text-center">
                        <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-sm font-black text-slate-800 tracking-tight mb-1">No Physical Addresses Added</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto mb-6">
                            Configure standard home, billing and branch locations to streamline actions.
                        </p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md shadow-indigo-100"
                        >
                            <Plus className="w-4 h-4" /> Define First Address
                        </button>
                    </div>
                )}
            </div>

            {/* Help guidelines */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex items-start gap-4 shadow-inner">
                <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800 tracking-tight">Identity Address Guidelines</p>
                    <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                        Physical address definitions correspond directly with authorized credential lookups and multi-jurisdictional compliance protocols. Changing or deleting an address affects active authorizations and associated audit tracks.
                    </p>
                </div>
            </div>
        </div>
    );
}
