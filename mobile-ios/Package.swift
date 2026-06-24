// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "LegalSaaS",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "LegalSaaS",
            targets: ["LegalSaaS"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "LegalSaaS",
            dependencies: [],
            path: "LegalSaaS"
        ),
        .testTarget(
            name: "LegalSaaSTests",
            dependencies: ["LegalSaaS"],
            path: "LegalSaaSTests"
        )
    ]
)
