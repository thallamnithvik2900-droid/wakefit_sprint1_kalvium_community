import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // Check admin session
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden. Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    // Read query parameters
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    // Build Prisma filter
    const where: any = {};

    // -----------------------------
    // STATUS FILTER
    // -----------------------------
    if (status && status !== "All") {
      const upperStatus = status
        .toUpperCase()
        .replace(/\s+/g, "_");

      const validStatuses = [
        "PLACED",
        "ORDER_PLACED",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ];

      if (validStatuses.includes(upperStatus)) {
        if (
          upperStatus === "PLACED" ||
          upperStatus === "ORDER_PLACED"
        ) {
          where.OR = [
            {
              status: "PLACED",
            },
            {
              status: "ORDER_PLACED",
            },
          ];
        } else {
          where.status = upperStatus;
        }
      }
    }

    // -----------------------------
    // SEARCH FILTER
    // -----------------------------
    if (search && search.trim()) {
      const searchText = search.trim();

      const searchOR = [
        {
          id: {
            contains: searchText,
          },
        },
        {
          user: {
            name: {
              contains: searchText,
            },
          },
        },
        {
          user: {
            email: {
              contains: searchText,
            },
          },
        },
        {
          orderItems: {
            some: {
              product: {
                name: {
                  contains: searchText,
                },
              },
            },
          },
        },
      ];

      if (where.OR) {
        where.AND = [
          {
            OR: where.OR,
          },
          {
            OR: searchOR,
          },
        ];

        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    // -----------------------------
    // SORTING
    // -----------------------------
    let orderBy: any = {
      createdAt: "desc",
    };

    switch (sort) {
      case "oldest":
        orderBy = {
          createdAt: "asc",
        };
        break;

      case "highest":
        orderBy = {
          totalPrice: "desc",
        };
        break;

      case "lowest":
        orderBy = {
          totalPrice: "asc",
        };
        break;

      case "newest":
      default:
        orderBy = {
          createdAt: "desc",
        };
        break;
    }

    // -----------------------------
    // FETCH ORDERS
    // -----------------------------
    const orders = await prisma.order.findMany({
      where,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            addresses: true,
          },
        },

        orderItems: {
          include: {
            product: true,
          },
        },

        returnRequests: true,
      },

      orderBy,
    });

    return NextResponse.json(orders, {
      status: 200,
    });
  } catch (error) {
    console.error("Fetch admin orders error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch admin orders",
      },
      {
        status: 500,
      }
    );
  }
}