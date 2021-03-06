import { useEffect, useState } from 'react';
import profileImage from '../images/generic-profile.png'

export default function Profile({ usertype, username }) {
  const [userData, setUserData] = useState(
    {
      firstName: "None",
      lastName: "None",
      username: "None",
      photoURL: profileImage,
    });

  const [courses, setCourses] = useState([])
  const user = usertype === 'student' ? "Student" : "Professor";
  const courseListName = usertype === 'student' ? "Enrolled" : "Created";

  useEffect(() => {
    if (usertype === "student") {
      fetch('/api/student-profile?username=' + username, {
      method: 'GET'
      })
          .then(response => response.json())
          .then(data => {
            setUserData(data)
          });

      fetch('/api/enrolled-courses?username=' + username, {
        method: 'GET'
      })
          .then(response => response.json())
          .then(data => {
            setCourses([]);
            let courseCount = data.length;
            let coursesList = [];
            for (let i = 0; i < courseCount; i++) {
              coursesList.push(data[i].name);
            };
            setCourses(coursesList);
          })
    }
    else {
      fetch('/api/professor-profile?username=' + username, {
      method: 'GET'
      })
          .then(response => response.json())
          .then(data => {
            console.log(data)
            setUserData(data)
          });

      fetch('/api/created-courses?username=' + username, {
        method: 'GET'
      })
          .then(response => response.json())
          .then(data => {
            setCourses([]);
            let courseCount = data.length;
            let coursesList = [];
            for (let i = 0; i < courseCount; i++) {
              coursesList.push(data[i].name);
            };
            setCourses(coursesList);
          })
    }
  }, [usertype, username]);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-2 py-2 sm:px-2">
        <table className="bg-indigo-100 text-left w-full rounded-md">
          <tbody>
            <tr>
              <td className='p-3'>
                <img
                  className="h-48 w-48 rounded-full m-0"
                  src={profileImage}
                  alt=""
                />
              </td>
              <td>
                <h1 className="text-3xl font-medium text-indigo-900">{user} Profile</h1>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="border-t border-indigo-300">
        <dl>
          <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-indigo-900">Full Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.firstname + " " + userData.lastname}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-indigo-900">Username</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.username}</dd>
          </div>
          <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-indigo-900">{courseListName} Courses</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {courses.map((course) => (
                  <li key={course} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                  <div className="w-0 flex-1 flex items-center">
                    <span className="ml-2 flex-1 w-0 truncate">{course}</span>
                  </div>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
