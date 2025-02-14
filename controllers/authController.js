import User from "../models/User.js";

const verifyPhone = async (req, res) => {
  try {
    let { phone } = req.body;
    console.log(phone);
    if (!phone.startsWith("+91")) {
      phone = `+91${phone}`;
    }

    const user = await User.findOne({
      where: { phone },
      attributes: ["id", "phone"],
    });
    console.log(user);

    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).send("Invalid User");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server Eroor");
  }
};

const sendCred = async (req, res) => {
  try {
    console.log("Received credentials:", req.body);
    const { idToken, refreshToken } = req.body;

    if (!idToken || !refreshToken) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    // Set cookies with HTTP-only and Secure flags
    res.cookie("idToken", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Credentials saved successfully" });
  } catch (error) {
    console.error("Error saving credentials:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const verifyToken= async(req,res)=>{
  try {
    if(req.user){
      res.status(202).json({msg:"Token Verified", phone : req.user.phone_number});
    }
  } catch (error) {
    console.log(error);
  }
}

const logout= async(req,res)=>{
  res.clearCookie("idToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
}

export default { verifyPhone, sendCred, verifyToken, logout };
