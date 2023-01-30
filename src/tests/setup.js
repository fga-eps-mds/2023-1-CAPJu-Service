/*import dotenv from "dotenv";
dotenv.config();*/

jest.mock("../middleware/authMiddleware", () => {
  return {
    protect: jest.fn((req, res, next) => next()),
    authRole: jest.fn((roleArray) => (req, res, next) => next()),
  };
});

jest.setTimeout(9000);
