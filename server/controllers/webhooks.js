export const clerkWebhooks = async (req, res) => {
  try {
    console.log("CLERK WEBHOOK RECEIVED");

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    console.log("Verifying webhook...");

    const payload = whook.verify(req.body, headers);

    console.log("Webhook verified");

    const { data, type } = payload;

    console.log("Event type:", type);
    console.log("Clerk User ID:", data.id);

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageURL: data.image_url,
        };

        console.log("Creating MongoDB user:", userData);

        await User.create(userData);

        console.log("User created in MongoDB:", data.id);

        return res.status(200).json({
          success: true,
          message: "User created successfully",
        });
      }

      // keep your other cases...
    }
  } catch (error) {
    console.error("Clerk webhook error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};