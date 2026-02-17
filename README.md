# SwiftCart E-Commerce

Live Link: YOUR_DEPLOYED_URL_HERE  
GitHub Repository: YOUR_REPO_URL_HERE

## Project Overview
SwiftCart একটি রেসপন্সিভ ই-কমার্স ওয়েবসাইট। এখানে Fake Store API ব্যবহার করে:
- সব প্রোডাক্ট লোড করা হয়
- ক্যাটাগরি ডাইনামিকভাবে দেখানো হয়
- ক্যাটাগরি ক্লিক করলে ফিল্টারড প্রোডাক্ট আসে
- ডিটেইলস বাটনে প্রোডাক্ট মডাল ওপেন হয়
- Add to Cart করলে কার্ট কাউন্ট আপডেট হয় (LocalStorage সহ)

## API Endpoints
- All Products: `https://fakestoreapi.com/products`
- All Categories: `https://fakestoreapi.com/products/categories`
- Products by Category: `https://fakestoreapi.com/products/category/${category}`
- Single Product: `https://fakestoreapi.com/products/${id}`

## JavaScript Questions (Bangla)

### 1) `null` আর `undefined` এর মধ্যে পার্থক্য কী?
`undefined` মানে ভ্যারিয়েবলের জন্য এখনো কোনো ভ্যালু সেট করা হয়নি।  
`null` মানে ডেভেলপার ইচ্ছা করে ভ্যালু খালি/শূন্য রেখেছে।

উদাহরণ:
- `let x;` হলে `x` এর মান `undefined`
- `let y = null;` হলে `y` এর মান `null`

### 2) JavaScript এ `map()` ফাংশনের ব্যবহার কী? `forEach()` থেকে পার্থক্য কী?
`map()` একটি নতুন অ্যারে রিটার্ন করে, যেখানে প্রতিটি আইটেম ট্রান্সফর্ম করা যায়।  
`forEach()` শুধু লুপ চালায়, নতুন অ্যারে রিটার্ন করে না।

মূল পার্থক্য:
- `map()` -> নতুন অ্যারে দেয়
- `forEach()` -> `undefined` রিটার্ন করে
- ডাটা পরিবর্তন/রূপান্তরের জন্য `map()` বেশি উপযোগী

### 3) `==` আর `===` এর পার্থক্য কী?
`==` শুধুমাত্র ভ্যালু তুলনা করে, দরকার হলে টাইপ কনভার্ট করে।  
`===` ভ্যালুর সাথে টাইপও তুলনা করে, কনভার্সন করে না।

তাই নিরাপদ তুলনার জন্য সাধারণত `===` ব্যবহার করা উচিত।

### 4) API data fetch করার ক্ষেত্রে `async/await` এর গুরুত্ব কী?
API কল অ্যাসিনক্রোনাস হওয়ায় রেসপন্স আসতে সময় লাগে।  
`async/await` ব্যবহার করলে কোড সিঙ্ক্রোনাসের মতো সহজে পড়া যায় এবং Promise হ্যান্ডলিং পরিষ্কার হয়।

সুবিধা:
- কোড পড়া সহজ হয়
- `try/catch` দিয়ে error হ্যান্ডল করা সহজ হয়
- `.then()` চেইন কম লাগে

### 5) JavaScript এ Scope (Global, Function, Block) কী?
Scope মানে একটি ভ্যারিয়েবল কোথায় থেকে অ্যাক্সেস করা যাবে।

- Global Scope: পুরো প্রোগ্রাম/ফাইলে ব্যবহার করা যায়।
- Function Scope: ফাংশনের ভিতরে ডিক্লেয়ার করা ভ্যারিয়েবল, ফাংশনের বাইরে পাওয়া যায় না।
- Block Scope: `{}` ব্লকের ভিতরে `let`/`const` দিয়ে ডিক্লেয়ার করা ভ্যারিয়েবল, ব্লকের বাইরে পাওয়া যায় না।

## Notes
- Live link: 
