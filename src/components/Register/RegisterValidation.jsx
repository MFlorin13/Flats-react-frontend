import { db } from '../../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const checkEmailExists = async (email) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;  // Returns true if email exists, false if not
  } catch (error) {
    console.error("Error checking email existence:", error);
    return false;
  }
};

export const validateRegistration = async (register) => {
  // Input validation
  if (!register.firstName || !register.lastName || !register.email || !register.password || !register.birthDate) {
    throw new Error("All fields are required.");
  }

  // First name validation
  if (register.firstName.length < 2) {
    throw new Error("First name must be at least 2 characters long.");
  }

  // Last name validation
  if (register.lastName.length < 2) {
    throw new Error("Last name must be at least 2 characters long.");
  }

  // Email validation
  if (!/^\S+@\S+\.\S+$/.test(register.email)) {
    throw new Error("Invalid email format.");
  }

  // Check if email already exists in Firestore
  const emailExists = await checkEmailExists(register.email);
  if (emailExists) {
    throw new Error("Email is already registered. Please use a different email.");
  }

  // Password validation (at least 6 chars, one uppercase, one number, one special character)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
  if (!passwordRegex.test(register.password)) {
    throw new Error(
      "Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character."
    );
  }

  // Birthdate validation
  const birthDate = new Date(register.birthDate);
  const age = new Date().getFullYear() - birthDate.getFullYear();
  if (age < 18 || age > 120) {
    throw new Error("Age must be between 18 and 120 years.");
  }
};