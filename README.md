# Headway Learning - Mental Health eLearning Platform

Headway Learning is an informational eLearning platform focused on providing resources and educational content about mental health illnesses. The platform serves as a repository of detailed articles, multimedia, and descriptions of various mental health conditions.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Frontend Overview](#frontend-overview)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

The goal of **Headway Learning** is to spread awareness and provide education about mental health illnesses through informative articles, videos, and other resources. The platform is designed to offer an accessible learning experience for anyone seeking information on mental health conditions.

---

## Features

- **Comprehensive Information**: Detailed pages about various mental health illnesses.
- **Search Functionality**: Users can search and filter for specific mental health topics.
- **Multimedia Support**: Video and other educational materials to enhance learning.
- **Resource Links**: Links to external resources such as official health organizations and guides.

---

## Technology Stack

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React
- **Database**: PostgreSQL
- **ORM**: TypeORM (for managing database operations)
- **Authentication**: JWT

---

## API Documentation

### 1. **GET /api/illnesses**

**Description**: Fetch a list of all mental health illnesses.

**Response**:

```json
[
  {
    "id": 1,
    "name": "Anxiety Disorder",
    "description": "Detailed description about anxiety disorder",
    "symptoms": "List of symptoms",
    "treatments": "List of treatments",
    "videoUrl": "http://youtube.com/example",
    "resources": "http://example.com/resources"
  }
]
```

### 2. POST /api/illnesses (Admin Only)

**Description**: Add a new illness (requires admin privileges).

**Request**:

```json
[
  {
  "name": "New Illness",
  "description": "Description of the illness",
  "symptoms": "List of symptoms",
  "treatments": "List of treatments",
  "videoUrl": "http://youtube.com/example",
  "resources": "http://example.com/resources"
}
]
```

### 3. PUT /api/illnesses/ (Admin Only)

**Description**: Update the details of an existing illness by ID (requires admin privileges).

**Request**:

```json
[
  {
  "name": "Updated Illness Name",
  "description": "Updated description",
  "symptoms": "Updated symptoms",
  "treatments": "Updated treatments",
  "videoUrl": "http://youtube.com/example",
  "resources": "http://example.com/resources"
}
]
```


### 4. DELETE /api/illnesses/ (Admin Only)

**Description**: Delete an illness by ID (requires admin privileges).

**Response**:

```json
[
  {
  "message": "Illness deleted successfully"
}
]
```



## Database Models

### Illness Model

The **Illness** model contains all relevant information about a specific mental health illness.

| Field         | Type      | Description                                      |
|---------------|-----------|--------------------------------------------------|
| `id`          | `integer` | Primary key                                      |
| `name`        | `string`  | Name of the illness                              |
| `description` | `text`    | Detailed description of the illness              |
| `symptoms`    | `text`    | List of symptoms of the illness                  |
| `treatments`  | `text`    | List of treatment methods                        |
| `videoUrl`    | `string`  | Optional video link explaining the illness       |
| `resources`   | `string`  | Optional external resources or links             |

---

### Article Model (Optional)

The **Article** model allows additional articles or information pieces related to mental health to be stored and accessed by users.

| Field       | Type      | Description                                      |
|-------------|-----------|--------------------------------------------------|
| `id`        | `integer` | Primary key                                      |
| `title`     | `string`  | Title of the article                             |
| `content`   | `text`    | Main content of the article                      |
| `illnessId` | `integer` | Foreign key that links to an illness (optional)  |

---

### Video Model (Optional)

The **Video** model contains links to educational videos related to mental health illnesses.

| Field       | Type      | Description                                      |
|-------------|-----------|--------------------------------------------------|
| `id`        | `integer` | Primary key                                      |
| `title`     | `string`  | Title of the video                               |
| `videoUrl`  | `string`  | URL of the video                                 |
| `illnessId` | `integer` | Foreign key that links to an illness (optional)  |



## Frontend Overview

The frontend for **Headway Learning** will be built using **React** to provide an intuitive and user-friendly interface. The frontend will interact with the backend API to display information about mental health illnesses.

### Key Pages

- **Home Page**: Introduction to the platform and a listing of featured illnesses.
- **Illness Detail Page**: Provides detailed information about each illness, including symptoms, treatments, and any available multimedia resources.
- **Search and Filter**: Allows users to search for specific mental health conditions or filter by categories (e.g., anxiety, mood disorders, etc.).
- **Resources Page**: Displays additional articles and links to external resources for users.

---

## Contributing

We welcome contributions to **Headway Learning**. If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request and describe the changes you've made.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more information.


