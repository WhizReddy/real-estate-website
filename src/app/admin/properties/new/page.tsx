"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Property } from "@/types";
import { generateId, getCurrentTimestamp } from "@/lib/utils";
import { ArrowLeft, Plus, X } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import InteractiveMapView from "@/components/InteractiveMapView";
import { saveProperty } from "@/lib/data";
import { validateFormField } from "@/lib/validation";

interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: "house" | "condo" | "townhouse" | "apartment";
  yearBuilt?: number;
  features: string;
  status: "active" | "inactive" | "pending" | "sold";
  listingType: "sale" | "rent";
  isPinned: boolean;
}

export default function NewProperty() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featureInput, setFeatureInput] = useState("");
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isDirty, setIsDirty] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty: formIsDirty },
    setValue,
    watch,
    reset,
    getValues,
  } = useForm<PropertyFormData>({
    defaultValues: {
      city: "Tiranë",
      state: "Tiranë",
      lat: 41.3275,
      lng: 19.8187,
      status: "active",
      listingType: "sale",
      isPinned: false,
      propertyType: "apartment",
    },
  });

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("adminSession");
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [router]);

  // Real-time validation handler
  const handleFieldValidation = (fieldName: string, value: unknown) => {
    const error = validateFormField(fieldName, value);
    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: error ? error.message : "",
    }));
  };

  // Track form changes
  useEffect(() => {
    const hasChanges =
      formIsDirty || featuresList.length > 0 || propertyImages.length > 0;
    setHasUnsavedChanges(hasChanges);
    setIsDirty(hasChanges);
  }, [formIsDirty, featuresList.length, propertyImages.length]);

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Reset form to initial state
  const resetForm = () => {
    reset();
    setFeaturesList([]);
    setPropertyImages([]);
    setValidationErrors({});
    setHasUnsavedChanges(false);
    setIsDirty(false);
  };

  // Handle navigation with unsaved changes warning
  const handleNavigation = (href: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Ju keni ndryshime të paruajtura. Jeni të sigurt që doni të largoheni?"
      );
      if (confirmed) {
        router.push(href);
      }
    } else {
      router.push(href);
    }
  };

  const addFeature = () => {
    if (featureInput.trim() && !featuresList.includes(featureInput.trim())) {
      setFeaturesList([...featuresList, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);

    try {
      // Validate required images
      if (propertyImages.length === 0) {
        alert("Ju lutem ngarkoni të paktën një imazh për pasurinë.");
        setIsSubmitting(false);
        return;
      }

      const propertyData = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          coordinates: {
            lat: Number(data.lat),
            lng: Number(data.lng),
          },
        },
        details: {
          bedrooms: Number(data.bedrooms),
          bathrooms: Number(data.bathrooms),
          squareFootage: Number(data.squareFootage),
          propertyType: data.propertyType,
          yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : undefined,
        },
        images: propertyImages,
        features: featuresList,
        status: data.status,
        listingType: data.listingType,
        isPinned: data.isPinned,
      };

      // Save to database using the API
      const savedProperty = await saveProperty(propertyData);

      // Reset form state after successful submission
      resetForm();

      // Show success message
      alert("Pasuria u ruajt me sukses!");

      // Redirect to dashboard
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error creating property:", error);

      // Provide specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes("Validation failed")) {
          alert(
            `Gabim në validim: ${error.message.replace(
              "Validation failed: ",
              ""
            )}`
          );
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          alert(
            "Gabim në lidhje. Ju lutem kontrolloni internetin dhe provoni përsëri."
          );
        } else {
          alert(`Gabim: ${error.message}`);
        }
      } else {
        alert("Gabim gjatë ruajtjes së pasurisë. Ju lutem provoni përsëri.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation("/admin/dashboard")}
              className="flex items-center text-blue-100 hover:text-white mr-6 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Kthehu</span>
            </button>
            <h1 className="text-3xl font-bold text-white">Shto Pasuri të Re</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Informacione Bazë
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Titulli i Pasurisë *
                </label>
                <input
                  type="text"
                  {...register("title", {
                    required: "Titulli është i detyrueshëm",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="p.sh. Apartament Modern në Qendër të Tiranës"
                />
                {errors.title && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Përshkrimi *
                </label>
                <textarea
                  rows={4}
                  {...register("description", {
                    required: "Përshkrimi është i detyrueshëm",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Përshkruani pasurinë në detaje..."
                />
                {errors.description && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Çmimi (€) *
                </label>
                <input
                  type="number"
                  {...register("price", {
                    required: "Çmimi është i detyrueshëm",
                    min: 1,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="120000"
                />
                {errors.price && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Lloji i Shitjes *
                </label>
                <select
                  {...register("listingType")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sale">Për Shitje</option>
                  <option value="rent">Me Qira</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Imazhet e Pasurisë *
              </h2>
            </div>
            <ImageUploader
              images={propertyImages}
              onImagesChange={setPropertyImages}
              maxImages={10}
              maxSizePerImage={5}
            />
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Adresa dhe Lokacioni
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Rruga *
                </label>
                <input
                  type="text"
                  {...register("street", {
                    required: "Rruga është e detyrueshme",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="p.sh. Rruga Dëshmorët e Kombit, Nr. 15"
                />
                {errors.street && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.street.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Qyteti *
                </label>
                <input
                  type="text"
                  {...register("city", {
                    required: "Qyteti është i detyrueshëm",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.city && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Kodi Postar
                </label>
                <input
                  type="text"
                  {...register("zipCode")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("lat", {
                    required: "Latitude është e detyrueshme",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="41.3275"
                />
                {errors.lat && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.lat.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("lng", {
                    required: "Longitude është e detyrueshme",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="19.8187"
                />
                {errors.lng && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.lng.message}
                  </p>
                )}
              </div>
            </div>

            {/* Interactive Map for Location Selection */}
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">
                Zgjidhni Lokacionin në Hartë
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Kliko në hartë për të zgjedhur lokacionin e saktë të pasurisë.
                Koordinatat do të përditësohen automatikisht.
              </p>
              <InteractiveMapView
                mode="edit"
                selectedLocation={
                  watch("lat") && watch("lng")
                    ? { lat: watch("lat"), lng: watch("lng") }
                    : undefined
                }
                onLocationSelect={(lat, lng) => {
                  setValue("lat", lat);
                  setValue("lng", lng);
                }}
                height="400px"
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-300 to-blue-400 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Detajet e Pasurisë
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Dhoma Gjumi
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("bedrooms", { min: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Banjo *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  {...register("bathrooms", {
                    required: "Numri i banjove është i detyrueshëm",
                    min: 1,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
                {errors.bathrooms && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.bathrooms.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Sipërfaqja (m²) *
                </label>
                <input
                  type="number"
                  min="1"
                  {...register("squareFootage", {
                    required: "Sipërfaqja është e detyrueshme",
                    min: 1,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="85"
                />
                {errors.squareFootage && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.squareFootage.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Lloji i Pasurisë *
                </label>
                <select
                  {...register("propertyType")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="apartment">Apartament</option>
                  <option value="house">Shtëpi</option>
                  <option value="condo">Kondo</option>
                  <option value="townhouse">Vila</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Viti i Ndërtimit
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  {...register("yearBuilt")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2018"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Statusi *
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Aktive</option>
                  <option value="inactive">Jo-aktive</option>
                  <option value="pending">Në Pritje</option>
                  <option value="sold">E Shitur</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">5</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Karakteristikat
              </h2>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addFeature())
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Shto karakteristikë (p.sh. Dysheme parket)"
              />
              <button
                type="button"
                onClick={addFeature}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {featuresList.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-gray-500 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cilësimet
            </h2>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("isPinned")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Pin në faqen kryesore (do të shfaqet në krye të listës)
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => handleNavigation("/admin/dashboard")}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Anulo
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Duke ruajtur..." : "Ruaj Pasurinë"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
