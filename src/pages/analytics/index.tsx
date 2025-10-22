"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { apiClient } from "../../services/api/apiClient.ts"

interface AnalyticsData {
  monthlyTrends: Array<{
    _id: { year: number; month: number }
    count: number
    statuses: string[]
  }>
  statusDistribution: Array<{
    _id: string
    count: number
  }>
  typeDistribution: Array<{
    _id: string
    count: number
  }>
  period: string
}

interface TopCompany {
  _id: string
  count: number
  latestApplication: string
  statuses: string[]
}

const Analytics = () => {
  const navigate = useNavigate()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<"1month" | "3months" | "6months" | "1year">("6months")

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [trendsResponse, companiesResponse] = await Promise.all([
        apiClient.getAnalyticsTrends({ period: selectedPeriod }),
        apiClient.getTopCompanies({ limit: 10 })
      ])

      if (trendsResponse.success) {
        setAnalyticsData(trendsResponse.data)
      } else {
        setError("Failed to fetch analytics trends")
      }

      if (companiesResponse.success) {
        setTopCompanies(companiesResponse.data.topCompanies)
      } else {
        setError("Failed to fetch top companies")
      }
    } catch (err) {
      console.error("Error fetching analytics:", err)
      setError("Failed to fetch analytics data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const formatMonth = (year: number, month: number) => {
    const date = new Date(year, month - 1)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      "Applied": "bg-blue-100 text-blue-800",
      "Under Review": "bg-yellow-100 text-yellow-800",
      "Interview": "bg-purple-100 text-purple-800",
      "Accepted": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800",
      "Withdrawn": "bg-gray-100 text-gray-800"
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading analytics...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Insights into your application patterns</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/applications')}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                View Applications
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium"
              >
                Add Application
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Period Selector */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Time Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Analytics Content */}
        {analyticsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Trends */}
            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Application Trends</h3>
              {analyticsData.monthlyTrends.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.monthlyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">
                          {formatMonth(trend._id.year, trend._id.month)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {trend.count} application{trend.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">{trend.count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available for the selected period
                </div>
              )}
            </div>

            {/* Status Distribution */}
            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Status Distribution</h3>
              {analyticsData.statusDistribution.length > 0 ? (
                <div className="space-y-3">
                  {analyticsData.statusDistribution.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status._id)}`}>
                          {status._id}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-foreground">{status.count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No status data available
                </div>
              )}
            </div>

            {/* Application Type Distribution */}
            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Application Types</h3>
              {analyticsData.typeDistribution.length > 0 ? (
                <div className="space-y-3">
                  {analyticsData.typeDistribution.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium text-foreground">{type._id}</span>
                      <span className="text-lg font-semibold text-primary">{type.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No type data available
                </div>
              )}
            </div>

            {/* Top Companies */}
            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Top Companies</h3>
              {topCompanies.length > 0 ? (
                <div className="space-y-3">
                  {topCompanies.map((company, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">{company._id}</div>
                        <div className="text-sm text-muted-foreground">
                          Latest: {new Date(company.latestApplication).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-primary">{company.count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No company data available
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground mb-4">
              Start creating applications to see analytics insights.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Create First Application
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
