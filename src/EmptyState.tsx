import React from "react"
import { Link, useHistory } from "react-router-dom"

const variantCopy = {
  permission: {
    title: "Insufficient permissions",
    description:
      "You don’t have the necessary permissions to view this resource. Contact your administrator for access.",
  },
  noAccess: {
    title: "Insufficient access",
    description: "You don’t have the necessary access to view this content.",
  },
  noClusters: {
    title: "No clusters",
    description:
      "You must connect a cluster to create namespaces. If you only have one cluster, you can also connect the cluster that {productName} is running in.",
  },
}

function EmptyState({
  variant,
  productName,
}: {
  variant: "permission" | "noAccess" | "noClusters"
  productName?: string
}) {
  const history = useHistory()

  return (
    <div className="bg-background flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center md:max-w-xl">
        <div className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {variantCopy[variant].title}
        </h1>
        <p className="text-muted-foreground mt-4">
          {variantCopy[variant].description.replace("{productName}", productName || "")}
        </p>
        <div className="mt-6">
          <Link
            to="#"
            onClick={() => history.goBack()}
            className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus:ring-primary inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors">
            Go Back
          </Link>
        </div>
      </div>
    </div>
  )
}

export { EmptyState }
