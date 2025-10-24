"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../services/api/apiClient.ts"
import { Search, X, Edit2, Trash2, Eye, ArrowUpDown } from "lucide-react"

interface Application {
  _id: string
  companyName: string
  position: string
  location: string
  applicationDate: string
  status: string
  applicationType: string
  source: string
  jobLink?: string
  resumeVersion?: string
  contactPerson?: string
  contactEmail?: string
  notes?: string
  followUpDate?: string
  interviewRounds?: Array<{
    round: string
    date: string
    result: string
  }>
  offerDetails?: {
    stipend?: string
    duration?: string
    startDate?: string
  }
}

const ViewApplications = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [allApplications, setAllApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalApplications, setTotalApplications] = useState(0)
  const [statusFilter, setStatusFilter] = useState("All")
  const [monthFilter, setMonthFilter] = useState("All")
  const [yearFilter, setYearFilter] = useState("All")
  const [sortBy, setSortBy] = useState("applicationDate")
  const [sortOrder, setSortOrder] = useState("desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("company")
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [editingApplication, setEditingApplication] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [deletingApplication, setDeletingApplication] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const itemsPerPage = 6

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)

      let response

      // Use searchApplications API if search query is provided
      if (debouncedSearchQuery.trim()) {
        const searchParams: any = {
          page: currentPage,
          limit: itemsPerPage,
        }

        if (searchType === "company") {
          searchParams.companyName = debouncedSearchQuery
        } else if (searchType === "position") {
          searchParams.position = debouncedSearchQuery
        } else if (searchType === "location") {
          searchParams.location = debouncedSearchQuery
        }

        console.log("Calling searchApplications API with params:", searchParams)
        response = await apiClient.searchApplicationsByKeywords(searchParams)
        console.log("searchApplications API response:", response)
      }
      // Use filterApplications API if any filters are applied
      else if (statusFilter !== "All" || monthFilter !== "All" || yearFilter !== "All") {
        const filterParams: any = {
          page: currentPage,
          limit: itemsPerPage,
        }

        if (statusFilter !== "All") {
          filterParams.status = statusFilter
        }
        if (monthFilter !== "All") {
          filterParams.month = parseInt(monthFilter)
        }
        if (yearFilter !== "All") {
          filterParams.year = parseInt(yearFilter)
        }

        console.log("Calling filterApplications API with params:", filterParams)
        response = await apiClient.filterApplicationsByCriteria(filterParams)
        console.log("filterApplications API response:", response)
      } else {
        // Use sortApplications API for sorting and pagination
        const sortParams: any = {
          page: currentPage,
          limit: itemsPerPage,
          by: sortBy,
          order: sortOrder,
        }

        console.log("Calling sortApplications API with params:", sortParams)
        response = await apiClient.sortApplicationsByField(sortParams)
        console.log("sortApplications API response:", response)
      }

      if (response.success) {
        setAllApplications(response.data.applications)
        setApplications(response.data.applications)
        setTotalPages(response.data.pagination.totalPages)
        setTotalApplications(response.data.pagination.totalItems)
      } else {
        setError("Failed to fetch applications")
      }
    } catch (err) {
      console.error("Error fetching applications:", err)
      setError("Failed to fetch applications. Please try again.")
    } finally {
      setLoading(false)
    }
  }


  const handleViewJob = async (applicationId: string) => {
    try {
      console.log("Calling getApplicationById API for ID:", applicationId)
      const response = await apiClient.fetchApplicationById(applicationId)
      console.log("getApplicationById API response:", response)

      if (response.success) {
        setSelectedApplication(response.data.application)
        setShowApplicationModal(true)
      } else {
        setError("Failed to fetch application details")
      }
    } catch (err) {
      console.error("Error fetching application details:", err)
      setError("Failed to fetch application details. Please try again.")
    }
  }

  const handleEdit = async (application: any) => {
    try {
      console.log("Preparing to edit application:", application._id)
      setEditingApplication(application)
      setEditFormData({
        companyName: application.companyName,
        position: application.position,
        location: application.location,
        applicationDate: application.applicationDate,
        status: application.status,
        applicationType: application.applicationType,
        source: application.source,
        jobLink: application.jobLink || "",
        resumeVersion: application.resumeVersion || "",
        contactPerson: application.contactPerson || "",
        contactEmail: application.contactEmail || "",
        notes: application.notes || "",
        followUpDate: application.followUpDate || "",
      })
      setShowEditModal(true)
    } catch (err) {
      console.error("Error preparing edit form:", err)
      setError("Failed to prepare edit form. Please try again.")
    }
  }

  const handleEditSubmit = async (e: any) => {
    e.preventDefault()
    try {
      console.log("Calling updateApplication API for ID:", editingApplication._id)
      console.log("Update data:", editFormData)

      const response = await apiClient.updateExistingApplication(editingApplication._id, editFormData)
      console.log("updateApplication API response:", response)

      if (response.success) {
        setShowEditModal(false)
        setEditingApplication(null)
        setEditFormData({})
        await fetchApplications()
        setError(null)
      } else {
        setError("Failed to update application")
      }
    } catch (err) {
      console.error("Error updating application:", err)
      setError("Failed to update application. Please try again.")
    }
  }

  const handleDelete = (application: any) => {
    console.log("Preparing to delete application:", application._id)
    setDeletingApplication(application)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      console.log("Calling deleteApplication API for ID:", deletingApplication._id)

      const response = await apiClient.removeApplication(deletingApplication._id)
      console.log("deleteApplication API response:", response)

      if (response.success) {
        setShowDeleteModal(false)
        setDeletingApplication(null)
        await fetchApplications()
        setError(null)
      } else {
        setError("Failed to delete application")
      }
    } catch (err) {
      console.error("Error deleting application:", err)
      setError("Failed to delete application. Please try again.")
    }
  }

  // Debounce search query to prevent API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchApplications()
  }, [currentPage, statusFilter, monthFilter, yearFilter, sortBy, sortOrder, debouncedSearchQuery, searchType])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleMonthFilter = (month: string) => {
    setMonthFilter(month)
    setCurrentPage(1)
  }

  const handleYearFilter = (year: string) => {
    setYearFilter(year)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Applied: "bg-blue-50 text-blue-700 border border-blue-200",
      "Under Review": "bg-amber-50 text-amber-700 border border-amber-200",
      Interview: "bg-purple-50 text-purple-700 border border-purple-200",
      Accepted: "bg-green-50 text-green-700 border border-green-200",
      Rejected: "bg-red-50 text-red-700 border border-red-200",
      Withdrawn: "bg-gray-50 text-gray-700 border border-gray-200",
    }
    return colors[status] || "bg-gray-50 text-gray-700 border border-gray-200"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderPagination = () => {
    const pages: any[] = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            i === currentPage
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          {i}
        </button>,
      )
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalApplications)} to{" "}
          {Math.min(currentPage * itemsPerPage, totalApplications)} of {totalApplications} applications
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg text-gray-600">Loading applications...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Applications</h1>
              <p className="text-gray-600">Track and manage your internship applications</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigate("/analytics")}
                  className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all border border-gray-200 font-medium shadow-sm"
                >
                  Analytics
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md"
                >
                  Add New Application
                </button>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 w-full">
                <div className="flex gap-2">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="company">Company</option>
                    <option value="position">Position</option>
                    <option value="location">Location</option>
                  </select>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search by ${searchType}...`}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setDebouncedSearchQuery("")
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Interview">Interview</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
              <select
                value={monthFilter}
                onChange={(e) => handleMonthFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="applicationDate">Application Date</option>
                  <option value="companyName">Company Name</option>
                  <option value="status">Status</option>
                  <option value="position">Position</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className={`px-4 py-2 border rounded-lg transition-all ${
                    sortOrder === "asc" 
                      ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100" 
                      : "bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                  }`}
                  title={sortOrder === "asc" ? "Currently: Ascending - Click for Descending" : "Currently: Descending - Click for Ascending"}
                >
                  {sortOrder === "asc" ? (
                    <span className="text-sm font-semibold">↑ ASC</span>
                  ) : (
                    <span className="text-sm font-semibold">↓ DESC</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(statusFilter !== "All" || monthFilter !== "All" || yearFilter !== "All" || sortBy !== "applicationDate" || sortOrder !== "desc" || searchQuery.trim()) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter("All")
                  setMonthFilter("All")
                  setYearFilter("All")
                  setSortBy("applicationDate")
                  setSortOrder("desc")
                  setSearchQuery("")
                  setDebouncedSearchQuery("")
                  setCurrentPage(1)
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all border border-gray-300"
              >
                Clear All Filters, Search & Reset Sort
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Applications Grid */}
        {applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? `No applications found matching "${searchQuery}" in ${searchType}.`
                : statusFilter === "All"
                  ? "You haven't submitted any applications yet."
                  : `No applications found with status "${statusFilter}".`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Company and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{application.companyName}</h3>
                      <p className="text-sm text-gray-600">{application.position}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${getStatusColor(application.status)}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-5 h-5 mr-2">📍</span>
                      {application.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-5 h-5 mr-2">📅</span>
                      {formatDate(application.applicationDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-5 h-5 mr-2">🏷️</span>
                      {application.applicationType}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-5 h-5 mr-2">🔗</span>
                      {application.source}
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(application.contactPerson || application.contactEmail) && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Contact</div>
                      {application.contactPerson && (
                        <div className="text-sm text-gray-900 font-medium">{application.contactPerson}</div>
                      )}
                      {application.contactEmail && (
                        <div className="text-sm text-gray-600">{application.contactEmail}</div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {application.notes && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Notes</div>
                      <p className="text-sm text-gray-600 line-clamp-2">{application.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewJob(application._id)}
                      className="flex-1 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center gap-2 border border-blue-200"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(application)}
                      className="flex-1 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 border border-gray-300"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(application)}
                      className="flex-1 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}

        {/* Application Details Modal */}
        {showApplicationModal && selectedApplication && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Company</label>
                    <p className="text-gray-900 font-semibold mt-1">{selectedApplication.companyName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Position</label>
                    <p className="text-gray-900 font-semibold mt-1">{selectedApplication.position}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</label>
                    <p className="text-gray-900 font-semibold mt-1">{selectedApplication.location}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</label>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(selectedApplication.status)}`}
                    >
                      {selectedApplication.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Application Date
                    </label>
                    <p className="text-gray-900 font-semibold mt-1">
                      {formatDate(selectedApplication.applicationDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</label>
                    <p className="text-gray-900 font-semibold mt-1">{selectedApplication.applicationType}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Source</label>
                    <p className="text-gray-900 font-semibold mt-1">{selectedApplication.source}</p>
                  </div>
                  {selectedApplication.jobLink && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Job Link</label>
                      <a
                        href={selectedApplication.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 break-all font-semibold mt-1 block"
                      >
                        View Job →
                      </a>
                    </div>
                  )}
                </div>

                {selectedApplication.notes && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Notes</label>
                    <p className="text-gray-900 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {selectedApplication.notes}
                    </p>
                  </div>
                )}

                {(selectedApplication.contactPerson || selectedApplication.contactEmail) && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Contact Information
                    </label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                      {selectedApplication.contactPerson && (
                        <p className="text-gray-900">
                          <span className="font-semibold">Person:</span> {selectedApplication.contactPerson}
                        </p>
                      )}
                      {selectedApplication.contactEmail && (
                        <p className="text-gray-900">
                          <span className="font-semibold">Email:</span> {selectedApplication.contactEmail}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedApplication.interviewRounds && selectedApplication.interviewRounds.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Interview Rounds
                    </label>
                    <div className="mt-2 space-y-3">
                      {selectedApplication.interviewRounds.map((round: any, index: number) => (
                        <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-gray-900 font-semibold">{round.round}</p>
                          <p className="text-sm text-gray-600 mt-1">Date: {formatDate(round.date)}</p>
                          <p className="text-sm text-gray-600">Result: {round.result}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApplication.offerDetails && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Offer Details</label>
                    <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
                      {selectedApplication.offerDetails.stipend && (
                        <p className="text-gray-900">
                          <span className="font-semibold">Stipend:</span> {selectedApplication.offerDetails.stipend}
                        </p>
                      )}
                      {selectedApplication.offerDetails.duration && (
                        <p className="text-gray-900">
                          <span className="font-semibold">Duration:</span> {selectedApplication.offerDetails.duration}
                        </p>
                      )}
                      {selectedApplication.offerDetails.startDate && (
                        <p className="text-gray-900">
                          <span className="font-semibold">Start Date:</span>{" "}
                          {formatDate(selectedApplication.offerDetails.startDate)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
                {selectedApplication.jobLink && (
                  <a
                    href={selectedApplication.jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Open Job Link
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Application Modal */}
        {showEditModal && editingApplication && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Application</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingApplication(null)
                    setEditFormData({})
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={editFormData.companyName || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Position</label>
                    <input
                      type="text"
                      value={editFormData.position || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                    <input
                      type="text"
                      value={editFormData.location || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Application Date</label>
                    <input
                      type="date"
                      value={editFormData.applicationDate ? editFormData.applicationDate.split("T")[0] : ""}
                      onChange={(e) => setEditFormData({ ...editFormData, applicationDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                    <select
                      value={editFormData.status || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Interview">Interview</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Application Type</label>
                    <select
                      value={editFormData.applicationType || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, applicationType: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="Summer">Summer</option>
                      <option value="Winter">Winter</option>
                      <option value="Fall">Fall</option>
                      <option value="Spring">Spring</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Source</label>
                    <input
                      type="text"
                      value={editFormData.source || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Job Link</label>
                    <input
                      type="url"
                      value={editFormData.jobLink || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, jobLink: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Resume Version</label>
                    <input
                      type="text"
                      value={editFormData.resumeVersion || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, resumeVersion: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={editFormData.contactPerson || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={editFormData.contactEmail || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Follow-up Date</label>
                    <input
                      type="date"
                      value={editFormData.followUpDate ? editFormData.followUpDate.split("T")[0] : ""}
                      onChange={(e) => setEditFormData({ ...editFormData, followUpDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Notes</label>
                  <textarea
                    value={editFormData.notes || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingApplication(null)
                      setEditFormData({})
                    }}
                    className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Update Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingApplication && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Delete Application</h2>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeletingApplication(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this application? This action cannot be undone.
                  </p>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="font-semibold text-gray-900">{deletingApplication.companyName}</div>
                    <div className="text-sm text-gray-600">{deletingApplication.position}</div>
                    <div className="text-sm text-gray-600">{deletingApplication.location}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeletingApplication(null)
                    }}
                    className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all"
                  >
                    Delete Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewApplications
