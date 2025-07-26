"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, User, Mail, Phone, Shield, Eye, EyeOff } from "lucide-react";
import { handleApiResponse, logError } from "@/lib/error-handler";

interface AgentFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role: 'ADMIN' | 'AGENT';
}

export default function NewAgent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AgentFormData>({
    defaultValues: {
      role: "AGENT",
    },
  });

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("adminSession");
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [router]);

  const password = watch("password");

  const onSubmit = async (data: AgentFormData) => {
    setIsSubmitting(true);

    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        alert("Fjalëkalimet nuk përputhen!");
        setIsSubmitting(false);
        return;
      }

      // Prepare data for API
      const agentData = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        password: data.password,
        role: data.role,
      };

      // Call the API to create agent
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      const result = await response.json();

      const { success, data: responseData, errorMessage } = handleApiResponse(result);
      
      if (!success) {
        logError('createAgent', result.error, { endpoint: '/api/agents', method: 'POST' });
        alert(errorMessage);
        return;
      }
      
      alert("Agjenti u krijua me sukses!");
      router.push("/admin/agents");
    } catch (error) {
      logError('createAgent', error, { endpoint: '/api/agents', method: 'POST' });
      alert("Gabim në rrjet. Ju lutem kontrolloni lidhjen dhe provoni përsëri.");
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
              onClick={() => router.push("/admin/agents")}
              className="flex items-center text-blue-100 hover:text-white mr-6 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Kthehu</span>
            </button>
            <h1 className="text-3xl font-bold text-white">Shto Agjent të Ri</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Informacione Personale
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Emri i Plotë *
                </label>
                <input
                  type="text"
                  {...register("name", {
                    required: "Emri është i detyrueshëm",
                    minLength: {
                      value: 2,
                      message: "Emri duhet të ketë të paktën 2 karaktere"
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="p.sh. Arben Kelmendi"
                />
                {errors.name && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email është i detyrueshëm",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email i pavlefshëm"
                      }
                    })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="agent@realestate-tirana.al"
                  />
                </div>
                {errors.email && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Telefoni
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    {...register("phone")}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+355 69 123 4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-900 to-emerald-900 bg-clip-text text-transparent">
                Siguria dhe Të Drejtat
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Fjalëkalimi *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Fjalëkalimi është i detyrueshëm",
                      minLength: {
                        value: 6,
                        message: "Fjalëkalimi duhet të ketë të paktën 6 karaktere"
                      }
                    })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Konfirmo Fjalëkalimin *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword", {
                      required: "Konfirmimi i fjalëkalimit është i detyrueshëm",
                      validate: value => value === password || "Fjalëkalimet nuk përputhen"
                    })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Roli *
                </label>
                <select
                  {...register("role")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AGENT">Agjent - Mund të krijojë dhe menaxhojë vetëm pasuritë e tij</option>
                  <option value="ADMIN">Administrator - Mund të menaxhojë të gjitha pasuritë dhe agjentët</option>
                </select>
              </div>
            </div>
          </div>

          {/* Permissions Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Të Drejtat e Rolit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Agjent:</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Mund të krijojë pasuri të reja</li>
                  <li>• Mund të editojë vetëm pasuritë e tij</li>
                  <li>• Mund të shikojë të gjitha pasuritë</li>
                  <li>• Mund të menaxhojë pyetjet për pasuritë e tij</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Administrator:</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Të gjitha të drejtat e agjentit</li>
                  <li>• Mund të editojë të gjitha pasuritë</li>
                  <li>• Mund të menaxhojë agjentët</li>
                  <li>• Mund të shikojë të gjitha pyetjet</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/admin/agents")}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Anulo
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Duke krijuar...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Krijo Agjentin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}