"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search, Navigation, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LocationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectLocation: (locationString: string) => void;
}

export function LocationModal({ open, onOpenChange, onSelectLocation }: LocationModalProps) {
    const [loadingGPS, setLoadingGPS] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Selected state
    const [selectedAddress, setSelectedAddress] = useState("");
    const [mapUrl, setMapUrl] = useState("");

    const handleGetLocation = () => {
        setLoadingGPS(true);
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setLoadingGPS(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Reverse geocode
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    if (data && data.display_name) {
                        setSelectedAddress(data.display_name);
                        setMapUrl(`https://static-maps.yandex.ru/1.x/?ll=${longitude},${latitude}&size=400,200&z=15&l=map&pt=${longitude},${latitude},pm2rdm`);
                    } else {
                        toast.error("Could not determine address from coordinates.");
                    }
                } catch (e) {
                    toast.error("Failed to reverse geocode location.");
                } finally {
                    setLoadingGPS(false);
                }
            },
            () => {
                toast.error("Failed to get your location. Please check permissions.");
                setLoadingGPS(false);
            }
        );
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setSearchResults(data || []);
        } catch (e) {
            toast.error("Search failed");
        } finally {
            setSearching(false);
        }
    };

    const handleSelectResult = (result: any) => {
        setSelectedAddress(result.display_name);
        setMapUrl(`https://static-maps.yandex.ru/1.x/?ll=${result.lon},${result.lat}&size=400,200&z=15&l=map&pt=${result.lon},${result.lat},pm2rdm`);
        setSearchResults([]);
    };

    const handleConfirm = () => {
        if (selectedAddress) {
            onSelectLocation(selectedAddress);
            onOpenChange(false);
            // Reset state for next time
            setTimeout(() => {
                setSelectedAddress("");
                setMapUrl("");
                setSearchQuery("");
                setSearchResults([]);
            }, 300);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-foreground/10">
                <DialogHeader className="p-6 pb-0 text-left">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <MapPin className="w-5 h-5 text-blue-500" />
                        </div>
                        <DialogTitle className="text-xl font-display font-semibold">Location Details</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Where is this happening? You can use GPS auto-detection or search manually.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-4">
                    {!selectedAddress ? (
                        <Tabs defaultValue="gps" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4 bg-foreground/5">
                                <TabsTrigger value="gps">GPS Auto</TabsTrigger>
                                <TabsTrigger value="manual">Manual Search</TabsTrigger>
                            </TabsList>
                            <TabsContent value="gps" className="space-y-4 pt-2">
                                <div className="bg-secondary/30 rounded-xl p-6 text-center border border-foreground/5 flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <Navigation className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Use Current Location</h3>
                                    <p className="text-xs text-muted-foreground mb-6 max-w-[250px]">
                                        We&apos;ll pinpoint where you are right now to accurately map the complaint.
                                    </p>
                                    <Button
                                        onClick={handleGetLocation}
                                        disabled={loadingGPS}
                                        className="w-full h-12 shadow-lg hover:shadow-primary/25 transition-all text-sm font-semibold rounded-xl"
                                    >
                                        {loadingGPS ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Locating...</>
                                        ) : (
                                            "Get My Location"
                                        )}
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="manual" className="space-y-4 pt-2">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search area, road, or city..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="h-12 bg-secondary/30 border-foreground/10 rounded-xl focus-visible:ring-primary focus-visible:border-primary"
                                    />
                                    <Button onClick={handleSearch} disabled={searching} className="h-12 w-12 shrink-0 rounded-xl">
                                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    </Button>
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {searchResults.map((result, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSelectResult(result)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-foreground/5 transition-colors border border-transparent hover:border-foreground/10 flex gap-3 text-sm"
                                            >
                                                <MapPin className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
                                                <span className="line-clamp-2 text-foreground/80">{result.display_name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="rounded-xl overflow-hidden border border-foreground/10 mb-4 bg-muted relative">
                                {mapUrl && (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={mapUrl} alt="Map preview" className="w-full h-[150px] object-cover" />
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3 pt-10">
                                    <p className="text-xs font-semibold text-foreground line-clamp-2 shadow-sm drop-shadow-md">
                                        {selectedAddress}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setSelectedAddress("")}>
                                    Modify
                                </Button>
                                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleConfirm}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
