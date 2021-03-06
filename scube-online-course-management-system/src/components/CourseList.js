import { Fragment, useRef, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationIcon } from '@heroicons/react/outline'
import { useHistory } from 'react-router';

export default function CourseList( { courseListType, usertype, username } ) {
  let history = useHistory();
  const [courses, setCourses] = useState([]);
  const [enrollAlert, setEnrollAlert] = useState(false);
  const [chosenCourse, setChosenCourse] = useState("");
  
  let action = "";
  let actionClass = "";
  let actionMessage = "";

  switch (courseListType) {
    case "created": action = "Remove";
                    actionClass = "px-5 py-2 text-red-600 hover:text-red-900 rounded-md bg-red-200 font-semibold";
                    actionMessage = "Are you sure you want to remove";
                    break;
    case "enrolled": action = "Unenroll";
                    actionClass = "px-5 py-2 text-red-600 hover:text-red-900 rounded-md bg-red-200 font-semibold";
                    actionMessage = "Are you sure you want to unenroll from";
                    break;
    default:        action = "Enroll";
                    actionClass = "px-5 py-2 text-green-600 hover:text-green-900 rounded-md bg-green-200 font-semibold";
                    actionMessage = "Are you sure you want to enroll in";
                    break;
  }

  const cancelButtonRef = useRef()

  useEffect(() => {
    if (usertype === "student1" || usertype === "student2") {
      if (usertype === "student2") {
        fetch('/api/available-courses?username=' + username, {
          method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
              setCourses([]);
              let courseCount = data.length;
              let coursesList = [];
              for (let i = 0; i < courseCount; i++) {
                coursesList.push(data[i]);
              };
              setCourses(coursesList);
              console.log(coursesList);
            })
      }
      else {
        fetch('/api/enrolled-courses?username=' + username, {
          method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
              setCourses([]);
              let courseCount = data.length;
              let coursesList = [];
              for (let i = 0; i < courseCount; i++) {
                coursesList.push(data[i]);
              };
              setCourses(coursesList);
              console.log(coursesList);
            })
      }
    }
    else {
      fetch('/api/created-courses?username=' + username, {
      method: 'GET'
      })
          .then(response => response.json())
          .then(data => {
            setCourses([]);
            let courseCount = data.length;
            let coursesList = [];
            for (let i = 0; i < courseCount; i++) {
              coursesList.push(data[i]);
            };
            setCourses(coursesList);
            console.log(coursesList);
          })
    }
  }, [usertype, username]);

  const enrollHandler = courseName => {
    setChosenCourse(courseName);
    setEnrollAlert(true);
  }

  const enrollmentHandler = (courseName) => {
    setEnrollAlert(false);
    username = localStorage.getItem("username");

    if (courseListType === "available") {
      fetch('/api/enroll-course?username=' + username + '&courseName=' + courseName, {
        method: 'POST'
      })
          .then(response => response.json())
          .then(data => {
            console.log(data['success']);
            if (data['success']) {
              history.push('/enrolledcourses');
            }
            window.location.reload();
          })
    }
    else if (courseListType === "created") {
      fetch('/api/delete-course?courseName=' + courseName, {
        method: 'DELETE'
      })
          .then(response => response.json())
          .then(data => {
            console.log(data['success']);
            if (data['success']) {
              history.push('/createdCourses');
            }
            window.location.reload();
          })
    }
    else {
      fetch('/api/unenroll-course?username=' + username + '&courseName=' + courseName, {
        method: 'POST'
      })
          .then(response => response.json())
          .then(data => {
            console.log(data['success']);
            if (data['success']) {
              history.push('/availablecourses');
            }
            window.location.reload();
          })
    }
  }

  const redirectToDashboard = (courseName) => {
    localStorage.setItem("chosenCourse", courseName)
    history.push('/courseDashboard');
    window.location.reload();
  }

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="py-1 align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Professor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Students Enrolled
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.name} style={{height: '25vh'}}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          {courseListType === "enrolled" || courseListType === "created" ?
                            <div id={course.name} className="text-sm font-medium text-gray-900 cursor-pointer" onClick={e => redirectToDashboard(e.target.id)}>{course.name}</div> :
                            <div className="text-sm font-medium text-gray-900">{course.name}</div>
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <textarea className="text-sm text-gray-900 resize-none" style={{height: '25vh'}} value={course.description} readOnly={true}/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"> {course.professor} </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {course.students.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button id={course.name} onClick={e => enrollHandler(e.target.id)} className={actionClass}>
                        {action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Transition.Root show={enrollAlert} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed z-10 inset-0 overflow-y-auto"
          initialFocus={cancelButtonRef}
          open={enrollAlert}
          onClose={setEnrollAlert}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        {action}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {actionMessage}<br/><span className="text-indigo-900 font-semibold">{chosenCourse}</span>?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => enrollmentHandler(chosenCourse)}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setEnrollAlert(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}
