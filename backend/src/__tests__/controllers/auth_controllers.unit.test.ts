import type { Request, Response } from "express";
import { 
  user_signup, 
  user_login, 
  auth_user, 
  refresh_token, 
  logout_user, 
  update_profile_image 
} from "../../controllers/auth_controllers";
import type { AuthenticatedRequest } from "../../interfaces/auth_interface";


jest.mock("../../models/auth_models", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  }
}));

jest.mock("../../services/hashing_services", () => ({
  hash_password_func: jest.fn(),
  verify_password: jest.fn(),
}));

jest.mock("../../services/token_services", () => ({
  generateAccessTokenFunc: jest.fn(),
  generateRefreshTokenFunc: jest.fn(),
}));

jest.mock("../../interfaces/auth_interface", () => ({
  verifyAsync: jest.fn(),
  AuthenticatedRequest: {} 
}));

// Import the mocked modules
import { User } from "../../models/auth_models";
import { hash_password_func, verify_password } from "../../services/hashing_services";
import { generateAccessTokenFunc, generateRefreshTokenFunc } from "../../services/token_services";
import { verifyAsync } from "../../interfaces/auth_interface";

// Mock environment variables
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";

describe("Auth Controller - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockAuthenticatedRequest: Partial<AuthenticatedRequest>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockCookie: jest.Mock;
  let mockClearCookie: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockCookie = jest.fn();
    mockClearCookie = jest.fn();

    mockResponse = {
      status: mockStatus,
      json: mockJson,
      cookie: mockCookie,
      clearCookie: mockClearCookie
    };

    mockRequest = {
      body: {},
      cookies: {}
    };

    mockAuthenticatedRequest = {
      user: { id: "user123", username: "testuser" }
    };

    jest.clearAllMocks();
  });

  describe("user_signup", () => {
    it("should create user successfully when user does not exist", async () => {
      // Arrange
      mockRequest.body = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "password123"
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (hash_password_func as jest.Mock).mockResolvedValue("hashed_password_123");
      (User.create as jest.Mock).mockResolvedValue({
        id: "user123",
        username: "johndoe",
        firstname: "John",
        lastname: "Doe",
        profile_pic: null
      });
      (generateAccessTokenFunc as jest.Mock).mockReturnValue("mock_access_token");
      (generateRefreshTokenFunc as jest.Mock).mockReturnValue("mock_refresh_token");

      // Act
      await user_signup(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ username: "johndoe" });
      expect(hash_password_func).toHaveBeenCalledWith("password123");
      expect(User.create).toHaveBeenCalledWith({
        username: "johndoe",
        password: "hashed_password_123",
        firstname: "John",
        lastname: "Doe"
      });
      expect(generateAccessTokenFunc).toHaveBeenCalledWith({
        id: "user123",
        username: "johndoe"
      });
      expect(mockCookie).toHaveBeenCalledWith(
        "refreshToken",
        "mock_refresh_token",
        expect.any(Object)
      );
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User created successfully!',
        new_user: {
          id: "user123",
          firstname: "John",
          lastname: "Doe",
          username: "johndoe",
          profile_pic: null
        },
        access_token: "mock_access_token"
      });
    });

    it("should return 403 when user already exists", async () => {
      mockRequest.body = {
        firstname: "John",
        lastname: "Doe",
        username: "existinguser",
        password: "password123"
      };

      (User.findOne as jest.Mock).mockResolvedValue({ username: "existinguser" });

      await user_signup(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ error: "User already exists!" });
      expect(User.create).not.toHaveBeenCalled();
    });

    it("should return 400 when user creation fails", async () => {
      mockRequest.body = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "password123"
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (hash_password_func as jest.Mock).mockResolvedValue("hashed_password");
      (User.create as jest.Mock).mockResolvedValue(null);

      await user_signup(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "There was an error signing up!" });
    });

    it("should handle internal server error", async () => {
      mockRequest.body = {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "password123"
      };

      (User.findOne as jest.Mock).mockRejectedValue(new Error("Database error"));

      await user_signup(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: "Internal server error!" });
    });
  });

  describe("user_login", () => {
    it("should login user successfully with correct credentials", async () => {
      mockRequest.body = {
        username: "johndoe",
        password: "password123"
      };

      const mockUser = {
        id: "user123",
        username: "johndoe",
        password: "hashed_password"
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (verify_password as jest.Mock).mockResolvedValue(true);
      (generateAccessTokenFunc as jest.Mock).mockReturnValue("mock_access_token");
      (generateRefreshTokenFunc as jest.Mock).mockReturnValue("mock_refresh_token");

      await user_login(mockRequest as Request, mockResponse as Response);

      expect(User.findOne).toHaveBeenCalledWith({ username: "johndoe" });
      expect(verify_password).toHaveBeenCalledWith("password123", "hashed_password");
      expect(generateAccessTokenFunc).toHaveBeenCalledWith({
        id: "user123",
        username: "johndoe"
      });
      expect(mockCookie).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: "User logged in successfully!",
        accessToken: "mock_access_token"
      });
    });

    it("should return 403 when user does not exist", async () => {
      mockRequest.body = {
        username: "nonexistent",
        password: "password123"
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await user_login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ error: "User does not exist!" });
    });

    it("should return 403 when password is incorrect", async () => {
      mockRequest.body = {
        username: "johndoe",
        password: "wrongpassword"
      };

      const mockUser = {
        id: "user123",
        username: "johndoe",
        password: "hashed_password"
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (verify_password as jest.Mock).mockResolvedValue(false);

      await user_login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ message: "Password is incorrect!" });
    });
  });

  describe("auth_user", () => {
    it("should return authenticated user data", async () => {
      // Arrange
      const mockUser = {
        _id: "user123",
        username: "testuser",
        firstname: "John",
        lastname: "Doe",
        profile_pic: null
      };

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // Act
      await auth_user(mockAuthenticatedRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUser);
    });

    it("should return 401 when not authenticated", async () => {
      // Arrange
      const unauthenticatedRequest = { user: undefined };

      // Act
      await auth_user(unauthenticatedRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: "You are not authenticated!" });
    });

    it("should return 404 when user not found", async () => {
      // Arrange
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      // Act
      await auth_user(mockAuthenticatedRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: "User not found!" });
    });

    it("should handle internal server error", async () => {
      // Arrange
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("Database error"))
      });

      // Act
      await auth_user(mockAuthenticatedRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: "Internal server error!" });
    });
  });

  describe("refresh_token", () => {
    it("should refresh access token successfully with valid refresh token", async () => {
      // Arrange
      mockRequest.cookies = { refreshToken: "valid_refresh_token" };
      
      const decodedToken = { 
        id: "user123", 
        username: "testuser" 
      };
      
      (verifyAsync as jest.Mock).mockResolvedValue(decodedToken);
      (User.findOne as jest.Mock).mockResolvedValue({ 
        _id: "user123", 
        username: "testuser" 
      });
      (generateAccessTokenFunc as jest.Mock).mockReturnValue("new_access_token");

      // Act
      await refresh_token(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(verifyAsync).toHaveBeenCalledWith("valid_refresh_token", "test-refresh-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
      expect(generateAccessTokenFunc).toHaveBeenCalledWith({
        id: "user123",
        username: "testuser"
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ accessToken: "new_access_token" });
    });

    it("should return 401 when no refresh token provided", async () => {
      // Arrange
      mockRequest.cookies = {};

      // Act
      await refresh_token(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: "You are not authenticated!" });
    });

    it("should return 403 when refresh token is invalid", async () => {
      // Arrange
      mockRequest.cookies = { refreshToken: "invalid_token" };
      (verifyAsync as jest.Mock).mockResolvedValue(null);

      // Act
      await refresh_token(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ error: "Invalid user!" });
    });

    it("should return 403 when user not found", async () => {
      // Arrange
      mockRequest.cookies = { refreshToken: "valid_token" };
      (verifyAsync as jest.Mock).mockResolvedValue({ id: "user123", username: "testuser" });
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      await refresh_token(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ error: "Invalid user!" });
    });

    it("should handle missing REFRESH_TOKEN_SECRET", async () => {
      // Arrange
      delete process.env.REFRESH_TOKEN_SECRET;

      // Act
      await refresh_token(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: "Internal server error while refreshing token" });

      // Restore the env variable
      process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
    });

    it("should handle internal server error", async () => {
      // Arrange
      mockRequest.cookies = { refreshToken: "valid_token" };
      (verifyAsync as jest.Mock).mockRejectedValue(new Error("Token verification error"));

      // Act
      await refresh_token(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: "Internal server error while refreshing token" });
    });
  });

  describe("logout_user", () => {
    it("should logout user successfully", async () => {
      // Act
      await logout_user(mockAuthenticatedRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockClearCookie).toHaveBeenCalledWith('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: '/', 
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith('Logout successfully!');
    });

    it("should return 401 when not authenticated", async () => {
      // Arrange
      const unauthenticatedRequest = { user: undefined };

      // Act
      await logout_user(unauthenticatedRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: "You are not authenticated!" });
    });

    it("should handle internal server error", async () => {
      // Arrange
      mockClearCookie.mockImplementation(() => {
        throw new Error("Cookie error");
      });

      // Act
      await logout_user(mockAuthenticatedRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: "Internal server error while logging out" });
    });
  });

  describe("update_profile_image", () => {
    it("should update profile image successfully when file is provided", async () => {
      // Arrange
      const mockFile = {
        filename: 'profile123.jpg'
      };

      const updatedUser = {
        _id: 'user123',
        username: 'testuser',
        profile_pic: '/uploads/profile-pictures/profile123.jpg'
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

      const requestWithFile = {
        ...mockAuthenticatedRequest,
        file: mockFile
      };

      // Act
      await update_profile_image(requestWithFile as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: { profile_pic: '/uploads/profile-pictures/profile123.jpg' } },
        { new: true, runValidators: true }
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(updatedUser);
    });

    it("should return 401 when not authenticated", async () => {
      // Arrange
      const unauthenticatedRequest = { 
        user: undefined,
        file: { filename: 'profile.jpg' }
      };

      // Act
      await update_profile_image(unauthenticatedRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: "You are not authorized to perform this task!" });
    });

    it("should return 400 when no file uploaded", async () => {
      // Arrange
      const requestWithoutFile = {
        ...mockAuthenticatedRequest,
        file: undefined
      };

      // Act
      await update_profile_image(requestWithoutFile as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "No file uploaded!" });
    });

    it("should return 400 when user update fails", async () => {
      // Arrange
      const mockFile = {
        filename: 'profile123.jpg'
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const requestWithFile = {
        ...mockAuthenticatedRequest,
        file: mockFile
      };

      // Act
      await update_profile_image(requestWithFile as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "Could not update user!" });
    });

    it("should handle internal server error", async () => {
      // Arrange
      const mockFile = {
        filename: 'profile123.jpg'
      };

      (User.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("Database error"));

      const requestWithFile = {
        ...mockAuthenticatedRequest,
        file: mockFile
      };

      // Act
      await update_profile_image(requestWithFile as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: "Internal server error while updating profile!" });
    });
  });
});