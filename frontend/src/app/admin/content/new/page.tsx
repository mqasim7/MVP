// src/app/admin/content/new/page.tsx
"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { contentApi, companyApi, personaApi } from "@/lib/api";
import * as XLSX from "xlsx";
import moment from 'moment';
import { getStoredUser } from "@/lib/auth";

interface ContentFormData {
  title: string;
  type: "video" | "article" | "";
  description: string;
  persona_id: string[];
  url: string;
  company_id: string;
  platforms: string;
}

interface FormErrors {
  [key: string]: string;
}

interface CompanyOption {
  id: string;
  name: string;
}

interface PersonaOption {
  id: number;
  name: string;
  description: string;
  active: boolean;
  company_id?: number;
  company_name?: string;
}

interface BulkItem {
  title: string;
  url: string;
  publishDate: string;
}

export default function ContentCreationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<PersonaOption[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    type: "video",
    description: "",
    persona_id: [],
    url: "",
    company_id: "",
    platforms: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const [isBulk, setIsBulk] = useState(false);
  const [singleForm, setSingleForm] = useState({
    title: "",
    url: "",
    publishDate: "",
  });
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const [bulkErrors, setbulkErrors] = useState<string | null>(null);
  const user = getStoredUser();

  useEffect(() => {
    setErrors({});
    setbulkErrors(null);
  }, [isBulk]);

  const handleSingleChange = (field: string, value: string) => {
    setSingleForm((prev) => ({ ...prev, [field]: value }));
  };

  const parseCSV = (csvText: string): BulkItem[] => {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    if (
      headers[0] !== "title" ||
      headers[1] !== "url" ||
      headers[2] !== "publish date"
    ) {
      throw new Error("CSV must have headers: Title, URL, Publish Date");
    }

    const items: BulkItem[] = lines.slice(1).map((line, index) => {
      const values = line.split(",").map((v) => v.trim());
      if (values.length !== 3) {
        throw new Error(`Invalid row at line ${index + 2}`);
      }
      return {
        title: values[0],
        url: values[1],
        publishDate: values[2],
      };
    });

    return items;
  };

  // Converts Excel serial date to JS Date
  const excelDateToJSDate = (serial: number) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  };

  const formatDateMMDDYYYY = (date: Date) => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const parseExcel = (file: File): Promise<BulkItem[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          const headers = (json[0] || []).map((h: string) =>
            h.toLowerCase().trim()
          );
          if (
            headers[0] !== "title" ||
            headers[1] !== "url" ||
            headers[2] !== "publish date"
          ) {
            reject(
              new Error("Excel must have headers: Title, URL, Publish Date")
            );
            return;
          }

          const items: BulkItem[] = json
            .slice(1)
            .map((row: any[], index: number) => {
              if (!row[0] || !row[1] || !row[2]) {
                throw new Error(`Invalid row at line ${index + 2}`);
              }
              let publishDate = row[2];
              if (typeof publishDate === "number") {
                publishDate = formatDateMMDDYYYY(excelDateToJSDate(publishDate));
              } else {
                publishDate = publishDate.toString();
              }
              return {
                title: row[0].toString(),
                url: row[1].toString(),
                publishDate,
              };
            });

          resolve(items);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read Excel file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setBulkItems([]);
      return
    };
  
    setbulkErrors(null);
    setBulkItems([]);
  
    const fileName = file.name.toLowerCase();
  
    try {
      let parsed: any[] = [];
  
      if (fileName.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const text = reader.result as string;
            parsed = parseCSV(text);
  
            const invalidDateRow = parsed.find(item => {
              let date = item.publishDate || '';
              // Normalize: trim, remove \r, non-breaking spaces, etc.
              date = date.trim().replace(/\r/g, '').replace(/\u00A0/g, '');
              // Strict MM/DD/YYYY: month 1-12, day 1-31, year 4 digits
              const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
              const regexTest = regex.test(date);
              const momentTest = moment(date, ['M/D/YYYY', 'MM/DD/YYYY'], true).isValid();
              if (!regexTest || !momentTest) {
                // Log char codes for debugging
                const charCodes = Array.from(date as string).map((c: string) => c.charCodeAt(0));
                console.log('Date:', date, 'CharCodes:', charCodes, 'Regex:', regexTest, 'Moment:', momentTest);
              }
              if (!regexTest) return true;
              return !momentTest;
            });
  
            if (invalidDateRow) {
              setbulkErrors(`Invalid date format found. Dates must be in MM/DD/YYYY format and valid. Example: 8/17/2025`);
              return; // don't continue if error found
            }
  
            setBulkItems(parsed);
            setbulkErrors(null); // clear any previous error after successful validation
          } catch (err: any) {
            setbulkErrors(err.message);
          }
        };
        reader.readAsText(file);
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        parsed = await parseExcel(file);
  
        const invalidDateRow = parsed.find(item => {
          let date = item.publishDate || '';
          // Normalize: trim, remove \r, non-breaking spaces, etc.
          date = date.trim().replace(/\r/g, '').replace(/\u00A0/g, '');
          // Strict MM/DD/YYYY: month 1-12, day 1-31, year 4 digits
          const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
          const regexTest = regex.test(date);
          const momentTest = moment(date, ['M/D/YYYY', 'MM/DD/YYYY'], true).isValid();
          if (!regexTest || !momentTest) {
            // Log char codes for debugging
            const charCodes = Array.from(date as string).map((c: string) => c.charCodeAt(0));
            console.log('Date:', date, 'CharCodes:', charCodes, 'Regex:', regexTest, 'Moment:', momentTest);
          }
          if (!regexTest) return true;
          return !momentTest;
        });
  
        if (invalidDateRow) {
          setbulkErrors(`Invalid date format found. Dates must be in MM/DD/YYYY format. Example: 08/17/2025`);
          return;
        }
  
        setBulkItems(parsed);
        setbulkErrors(null);
      } else {
        setbulkErrors("Unsupported file format. Please upload CSV or Excel.");
      }
    } catch (err: any) {
      setbulkErrors(err.message);
    }
  };
  

  useEffect(() => {
    if (companyId) setFormData((prev) => ({ ...prev, company_id: companyId }));
  }, [companyId]);

  // Fetch companies and personas for the dropdowns
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [companiesResponse, personasResponse] = await Promise.all([
          companyApi.getAll(),
          personaApi.getAll(),
        ]);

        if (mounted) {
          setCompanies(companiesResponse || []);
          setPersonas(personasResponse || []);
          // Initially show all active personas
          setFilteredPersonas(
            (personasResponse || []).filter(
              (persona: PersonaOption) => persona.active
            )
          );
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        if (mounted) {
          setFetchError(
            "Failed to load companies and personas. Please try again later."
          );
        }
      } finally {
        if (mounted) {
          setLoadingPersonas(false);
        }
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter personas when company changes
  useEffect(() => {
    if (formData.company_id) {
      const companyPersonas = personas.filter(
        (persona) =>
          persona.active &&
          persona.company_id?.toString() === formData.company_id
      );
      setFilteredPersonas(companyPersonas);

      // Clear selected personas that don't belong to the new company
      const validPersonaIds = companyPersonas.map((p) => p.id.toString());
      const filteredSelectedPersonas = formData.persona_id.filter((id) =>
        validPersonaIds.includes(id)
      );

      if (filteredSelectedPersonas.length !== formData.persona_id.length) {
        setFormData((prev) => ({
          ...prev,
          persona_id: filteredSelectedPersonas,
        }));
      }
    } else {
      // Show all active personas if no company is selected
      setFilteredPersonas(personas.filter((persona) => persona.active));
    }
  }, [formData.company_id, personas]);

  const isValidUrl = (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Content title is required";
    } else if (formData.title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters";
    }

    if (!formData.type) {
      newErrors.type = "Please select a content type";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.persona_id.length) {
      newErrors.persona_id = "Select at least one persona";
    }

    if (!formData.platforms) {
      newErrors.platforms = "Platform is required.";
    }

    if (!formData.url || !isValidUrl(formData.url)) {
      newErrors.url = "Please enter a valid URL";
    }

    if (!formData.company_id) {
      newErrors.company_id = "Please select a company";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBulkForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.persona_id.length) {
      newErrors.persona_id = "Select at least one persona";
    }

    if (!formData.company_id) {
      newErrors.company_id = "Please select a company";
    }

    if (!formData.platforms) {
      newErrors.platforms = "Platform is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof Omit<ContentFormData, "persona_id">,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePersonasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setFormData((prev) => ({ ...prev, persona_id: selected }));
    if (errors.persona_id) {
      setErrors((prev) => ({ ...prev, persona_id: "" }));
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBulkForm()) {
      return;
    }
    setIsLoading(true);

    const payload = bulkItems.map((item) => ({
      title: item.title,
      personas: formData.persona_id,
      type: "video",
      content_url: item.url,
      company_id: formData.company_id,
      publish_date: item.publishDate,
      platforms: [Number(formData.platforms)]
    }));

    try {
      if (isBulk) {
        if (bulkItems.length === 0) {
          setbulkErrors("No valid items to upload.");
          return;
        }
        console.log("Submitting bulk items:", payload);
        const response = await contentApi.bulkCreate(payload);
        alert("Content created successfully!");
        if (companyId) router.push(`/admin/companies/${companyId}`);
        else router.push("/admin/content");
      }
    } catch (error: any) {
      setbulkErrors("Upload failed.");
      console.error("Error creating content:", error);
      if (error.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to create content. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        type: formData.type,
        description: formData.description.trim(),
        personas: formData.persona_id,
        url: formData.url.trim(),
        company_id: formData.company_id,
        content_url: formData.url,
        platforms: [Number(formData.platforms)],
        userId: user?.id
      };
      const response = await contentApi.create(payload);

      alert("Content created successfully!");
      if (companyId) router.push(`/admin/companies/${companyId}`);
      else router.push("/admin/content");
    } catch (error: any) {
      console.error("Error creating content:", error);
      if (error.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to create content. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonaDisplayText = (persona: PersonaOption): string => {
    return persona.company_name
      ? `${persona.name} (${persona.company_name})`
      : persona.name;
  };

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link
          href={companyId ? `/admin/companies/${companyId}` : "/admin/content"}
          className="btn btn-ghost btn-sm mr-4"
        >
          <ArrowLeft size={16} />
          {companyId ? "Back to Company" : "Back to Content"}
        </Link>
        <div className="flex items-center">
          <div className="bg-primary text-primary-content p-3 rounded-full mr-4">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create New Content</h1>
            <p className="text-base-content/70">
              Add a new content to the platform
            </p>
          </div>
        </div>
      </div>
      <div className="flex mb-6">
        <button
          className={`btn mr-2 ${!isBulk ? "btn-primary" : "btn-outline"}`}
          onClick={() => setIsBulk(false)}
        >
          Single Upload
        </button>
        <button
          className={`btn ${isBulk ? "btn-primary" : "btn-outline"}`}
          onClick={() => setIsBulk(true)}
        >
          Bulk Upload (CSV)
        </button>
      </div>

      {/* Error Alert */}
      {fetchError && (
        <div className="alert alert-error mb-6">
          <span>{fetchError}</span>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Form */}
      {isBulk ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleBulkSubmit}>
              {/* Company Selection */}
              {companyId ? null : (
                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text font-medium">Company *</span>
                  </label>
                  {fetchError ? (
                    <p className="text-error">{fetchError}</p>
                  ) : (
                    <select
                      className={`select select-bordered w-full ${
                        errors.company_id ? "select-error" : ""
                      }`}
                      value={formData.company_id}
                      onChange={(e) =>
                        handleInputChange("company_id", e.target.value)
                      }
                      disabled={isLoading || companies.length === 0}
                    >
                      <option value="">Select a company</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.company_id && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.company_id}
                      </span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt">
                      Select a company first to filter relevant personas
                    </span>
                  </label>
                </div>
              )}

              {/* Target Personas (Multi-Select) */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">
                    Target Personas *
                  </span>
                </label>
                {loadingPersonas ? (
                  <div className="flex items-center justify-center p-4 border rounded">
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    <span>Loading personas...</span>
                  </div>
                ) : (
                  <select
                    className={`select select-bordered w-full ${
                      errors.persona_id ? "select-error" : ""
                    }`}
                    multiple
                    value={formData.persona_id}
                    onChange={handlePersonasChange}
                    disabled={isLoading}
                    size={Math.min(filteredPersonas.length + 1, 6)}
                  >
                    {filteredPersonas.length === 0 ? (
                      <option disabled>
                        {formData.company_id
                          ? "No active personas found for selected company"
                          : "Select a company to see available personas"}
                      </option>
                    ) : (
                      filteredPersonas.map((persona) => (
                        <option key={persona.id} value={persona.id.toString()}>
                          {getPersonaDisplayText(persona)}
                        </option>
                      ))
                    )}
                  </select>
                )}
                <label className="label">
                  <span className="label-text-alt">
                    Hold Ctrl/Cmd to select multiple.
                    {formData.persona_id.length > 0 && (
                      <span className="font-medium">
                        {" "}
                        Selected: {formData.persona_id.length}
                      </span>
                    )}
                  </span>
                </label>
                {errors.persona_id && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.persona_id}
                    </span>
                  </label>
                )}
              </div>

              {/* Platform Selection */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">Platform *</span>
                </label>
                <select
                  className={`select select-bordered w-full ${
                    errors.platforms ? "select-error" : ""
                  }`}
                  value={formData.platforms}
                  onChange={(e) => handleInputChange("platforms", e.target.value)}
                  disabled={isLoading}
                >
                  <option value={""}>Select platform</option>
                  <option value={"1"}>Instagram</option>
                  <option value={"2"}>TikTok</option>
                </select>
                {errors.platforms && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.platforms}
                    </span>
                  </label>
                )}
              </div>

              {/* upload input */}
              <div>
                <label className="label font-medium">Upload File</label>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="file-input file-input-bordered w-full mb-4"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mb-2">
                  File must have headers:{" "}
                  <strong>Title, URL, Publish Date (format: MM/DD/YYYY)</strong>
                </p>
                 {/* Download sample Excel link */}
                  <a
                    href="/SampleUploadSheet.xlsx"
                    download
                    className="underline text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    Download Sample Excel Sheet
                  </a>

                {bulkItems.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">
                      Preview ({bulkItems.length} items):
                    </h4>
                    <div className="max-h-60 overflow-auto border p-2 rounded">
                      {bulkItems.map((item, idx) => (
                        <div key={idx} className="border-b py-1">
                          {item.title} — {item.url} — {item.publishDate}
                        </div>
                      ))}
                    </div>
                  </div>
                ): null}
              </div>
              {bulkErrors ? (
                <div className="alert alert-error mb-4">{bulkErrors}</div>
              ) : null}
              {/* Actions */}
              <div className="card-actions justify-end mt-6 pt-4 border-t border-base-300">
                <Link
                  href="/admin/content"
                  className="btn btn-ghost"
                  onClick={(e) => isLoading && e.preventDefault()}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || loadingPersonas}
                >
                  {isLoading && (
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                  )}
                  <Save size={16} className="mr-2" />
                  Create Content
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Content Title */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">
                    Content Title *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter title"
                  className={`input input-bordered w-full ${
                    errors.title ? "input-error" : ""
                  }`}
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  disabled={isLoading}
                />
                {errors.title && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.title}
                    </span>
                  </label>
                )}
              </div>

              {/* Content Type */}
              {/* <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium">Content Type *</span>
              </label>
              <select
                className={`select select-bordered w-full ${errors.type ? 'select-error' : ''}`}
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select Type</option>
                <option value="video">Video</option>
                <option value="article">Article</option>
              </select>
              {errors.type && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.type}</span>
                </label>
              )}
            </div> */}

              {/* Description */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">Description *</span>
                </label>
                <textarea
                  className={`textarea textarea-bordered w-full h-24 ${
                    errors.description ? "textarea-error" : ""
                  }`}
                  placeholder="Content description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={isLoading}
                />
                {errors.description && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.description}
                    </span>
                  </label>
                )}
              </div>

              {/* Company Selection */}
              {companyId ? null : (
                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text font-medium">Company *</span>
                  </label>
                  {fetchError ? (
                    <p className="text-error">{fetchError}</p>
                  ) : (
                    <select
                      className={`select select-bordered w-full ${
                        errors.company_id ? "select-error" : ""
                      }`}
                      value={formData.company_id}
                      onChange={(e) =>
                        handleInputChange("company_id", e.target.value)
                      }
                      disabled={isLoading || companies.length === 0}
                    >
                      <option value="">Select a company</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.company_id && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.company_id}
                      </span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt">
                      Select a company first to filter relevant personas
                    </span>
                  </label>
                </div>
              )}

              {/* Target Personas (Multi-Select) */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">
                    Target Personas *
                  </span>
                </label>
                {loadingPersonas ? (
                  <div className="flex items-center justify-center p-4 border rounded">
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    <span>Loading personas...</span>
                  </div>
                ) : (
                  <select
                    className={`select select-bordered w-full ${
                      errors.persona_id ? "select-error" : ""
                    }`}
                    multiple
                    value={formData.persona_id}
                    onChange={handlePersonasChange}
                    disabled={isLoading}
                    size={Math.min(filteredPersonas.length + 1, 6)}
                  >
                    {filteredPersonas.length === 0 ? (
                      <option disabled>
                        {formData.company_id
                          ? "No active personas found for selected company"
                          : "Select a company to see available personas"}
                      </option>
                    ) : (
                      filteredPersonas.map((persona) => (
                        <option key={persona.id} value={persona.id.toString()}>
                          {getPersonaDisplayText(persona)}
                        </option>
                      ))
                    )}
                  </select>
                )}
                <label className="label">
                  <span className="label-text-alt">
                    Hold Ctrl/Cmd to select multiple.
                    {formData.persona_id.length > 0 && (
                      <span className="font-medium">
                        {" "}
                        Selected: {formData.persona_id.length}
                      </span>
                    )}
                  </span>
                </label>
                {errors.persona_id && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.persona_id}
                    </span>
                  </label>
                )}
              </div>

              {/* Platform Selection */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">Platform *</span>
                </label>
                <select
                  className={`select select-bordered w-full ${
                    errors.platforms ? "select-error" : ""
                  }`}
                  value={formData.platforms}
                  onChange={(e) => handleInputChange("platforms", e.target.value)}
                  disabled={isLoading}
                >
                  <option value={""}>Select platform</option>
                  <option value={"1"}>Instagram</option>
                  <option value={"2"}>TikTok</option>
                </select>
                {errors.platforms && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.platforms}
                    </span>
                  </label>
                )}
              </div>
              {/* Content URL */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">Content URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/content"
                  className={`input input-bordered w-full ${
                    errors.url ? "input-error" : ""
                  }`}
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  disabled={isLoading}
                />
                {errors.url && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.url}
                    </span>
                  </label>
                )}
                <label className="label">
                  <span className="label-text-alt">
                    Optional: Direct link to the content
                  </span>
                </label>
              </div>

              {/* Preview Section */}
              {(formData.title ||
                formData.company_id ||
                formData.persona_id.length > 0) && (
                <div className="bg-base-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium mb-3">Content Preview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Title:</span>
                      <p className="text-base-content/70">
                        {formData.title || "Not entered"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <p className="text-base-content/70 capitalize">
                        {formData.type || "Not selected"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Company:</span>
                      <p className="text-base-content/70">
                        {formData.company_id
                          ? companies.find((c) => c.id === formData.company_id)
                              ?.name || "Unknown"
                          : "Not selected"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">
                        Target Personas ({formData.persona_id.length}):
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.persona_id.slice(0, 3).map((personaId) => {
                          const persona = filteredPersonas.find(
                            (p) => p.id.toString() === personaId
                          );
                          return persona ? (
                            <span
                              key={personaId}
                              className="badge badge-primary badge-outline badge-xs"
                            >
                              {persona.name}
                            </span>
                          ) : null;
                        })}
                        {formData.persona_id.length > 3 && (
                          <span className="badge badge-primary badge-outline badge-xs">
                            +{formData.persona_id.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    {formData.description && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Description:</span>
                        <p className="text-base-content/70 line-clamp-2">
                          {formData.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="card-actions justify-end mt-6 pt-4 border-t border-base-300">
                <Link
                  href="/admin/content"
                  className="btn btn-ghost"
                  onClick={(e) => isLoading && e.preventDefault()}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || loadingPersonas}
                >
                  {isLoading && (
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                  )}
                  <Save size={16} className="mr-2" />
                  Create Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
