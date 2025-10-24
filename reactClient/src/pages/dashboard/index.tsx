"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { apiClient } from "../../services/api/apiClient.ts"
import { authAPI } from "../../services/authapis/authapis.tsx"

const ApplicationForm = () => {
  const navigate = useNavigate()
  const [hasCreatedApplication, setHasCreatedApplication] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const initialFormState = {
    companyName: "",
    position: "",
    location: "",
    applicationDate: new Date().toISOString().split("T")[0],
    status: "Applied",
    applicationType: "Full-time",
    source: "",
    jobLink: "",
    resumeVersion: "",
    contactPerson: "",
    contactEmail: "",
    notes: "",
    followUpDate: "",
    interviewRounds: [],
    offerDetails: {
      stipend: "",
      duration: "",
      startDate: "",
    },
  }

  const [formData, setFormData] = useState(initialFormState)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Check if user has already created an application
  useEffect(() => {
    const hasCreated = authAPI.getHasApplicationCreated()
    setHasCreatedApplication(hasCreated)
    setShowForm(!hasCreated) // Show form only if no application created yet
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes("offerDetails.")) {
      const field = name.split(".")[1]
      setFormData({
        ...formData,
        offerDetails: {
          ...formData.offerDetails,
          [field]: value,
        },
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const applicationData = {
        ...formData,
        applicationDate: formData.applicationDate
          ? new Date(formData.applicationDate).toISOString()
          : new Date().toISOString(),
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : null,
        offerDetails: {
          ...formData.offerDetails,
          startDate: formData.offerDetails.startDate ? new Date(formData.offerDetails.startDate).toISOString() : null,
        },
      }

      console.log("Submitting application data:", applicationData)
      const response = await apiClient.createApplication(applicationData)
      console.log("API response:", response)

      if (response.success) {
        setSuccess("Application submitted successfully!")
        setFormData(initialFormState)
        // Set the flag to true after successful submission
        authAPI.setHasApplicationCreated(true)
        setHasCreatedApplication(true)
        setShowForm(false)
      } else {
        setError(response.message || "Failed to submit application")
      }
    } catch (err) {
      console.error("API Error:", err)
      setError(err.message || "Failed to submit application. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {hasCreatedApplication ? "Dashboard" : "Add New Application"}
              </h1>
              <p className="text-muted-foreground">
                {hasCreatedApplication 
                  ? "Manage your internship applications" 
                  : "Track your internship application details"
                }
              </p>
            </div>
            <button
              onClick={() => navigate('/applications')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              View Applications
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                {success}
              </div>
            )}

            {/* Show different content based on hasCreatedApplication and showForm */}
            {hasCreatedApplication && !showForm ? (
              // Dashboard view for users who have already created an application
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Welcome Back!</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  You've already created an application. You can view and manage your applications below.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/applications')}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                  >
                    View My Applications
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium"
                  >
                    Add Another Application
                  </button>
                </div>
              </div>
            ) : (
              // Form view for new users or when adding another application
              <div>
                {hasCreatedApplication && showForm && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-blue-800 text-sm">Adding another application</p>
                      <button
                        onClick={() => setShowForm(false)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">Basic Information</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder="e.g., Google, Microsoft"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Position *</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder="e.g., Software Engineering Intern"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder="e.g., San Francisco, CA"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Application Date *</label>
                    <input
                      type="date"
                      name="applicationDate"
                      value={formData.applicationDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Type Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">Status & Type</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    >
                      {["Applied", "Under Review", "Interview", "Accepted", "Rejected", "Withdrawn"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Application Type *</label>
                    <select
                      name="applicationType"
                      value={formData.applicationType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    >
                      {["Summer", "Winter", "Fall", "Spring", "Full-time", "Part-time"].map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Source & Links Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">Source & Links</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Source *</label>
                    <input
                      type="text"
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder="e.g., LinkedIn, Company Website"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Job Link</label>
                    <input
                      type="url"
                      name="jobLink"
                      value={formData.jobLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder="https://company.com/job-posting"
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">
                  Contact Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder="e.g., John Smith"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder="john@company.com"
                      maxLength={100}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">
                  Additional Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Resume Version</label>
                    <input
                      type="text"
                      name="resumeVersion"
                      value={formData.resumeVersion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder="e.g., Resume_v3.pdf"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Follow-up Date</label>
                    <input
                      type="date"
                      name="followUpDate"
                      value={formData.followUpDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                      placeholder="Any additional notes about this application..."
                      maxLength={1000}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Offer Details Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">
                  Offer Details (Optional)
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Stipend</label>
                    <input
                      type="text"
                      name="offerDetails.stipend"
                      value={formData.offerDetails.stipend}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder="e.g., $5,000/month"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Duration</label>
                    <input
                      type="text"
                      name="offerDetails.duration"
                      value={formData.offerDetails.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder="e.g., 3 months"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                    <input
                      type="date"
                      name="offerDetails.startDate"
                      value={formData.offerDetails.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  Submit Application
                </button>
              </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationForm