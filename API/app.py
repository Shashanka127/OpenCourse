from flask import Flask, request
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from datetime import datetime
import json

# Initializing App parameters
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Connecting to the MongoDB Cluster and getting database
mongoClient = MongoClient("mongodb+srv://admin:scube@scube.5egfi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
db = mongoClient.get_database('main_db')

# Getting collections from the database
student_records = db.get_collection('student_records')
professor_records = db.get_collection('professor_records')
courses = db.get_collection('courses')
forum = db.get_collection('forum_posts')
assignment=db.get_collection('assignment')
submission=db.get_collection('submission')

# ------------------------------------------------------------------------------------------------ #
# --------------------------------------- Defining the API --------------------------------------- #
# ------------------------------------------------------------------------------------------------ #

# --- Student account CRUD Operations ------------------------------------------------------------ #

# Create a new student account
@app.route('/api/student-register', methods=['POST'])
def create_student_account():
    firstName = request.args['firstName']
    lastName = request.args['lastName']
    photoURL = request.args['photoURL']
    username = request.args['username']
    password = request.args['password']

    if (student_records.count_documents({'username': username}) == 1):
        return {"success": False}

    student_records.insert_one({'firstname': firstName, 'lastname': lastName, 'username': username, 'password': password, 'photoURL': photoURL})
    return {"success": True}

# Check if a student's username exists
@app.route('/api/check-student-username', methods=['GET'])
def check_student_username():
    username = request.args['username']

    success = student_records.count_documents({'username': username}) == 1
    return {"success": success}

# Access a student's profile
@app.route('/api/student-profile', methods=['GET'])
def student_profile():
    username = request.args['username']

    student = student_records.find({"username": username})[0]
    del student['_id']

    return student

# Authenticate student login
@app.route('/api/student-login', methods=['GET'])
def authenticate_student_login():
    username = request.args['username']
    password = request.args['password']
    
    success = student_records.count_documents({'username': username, 'password': password}) == 1
    return {"success": success}

# Delete a student account
@app.route('/api/student-delete', methods=['DELETE'])
def delete_student_account():
    username = request.args['username']

    if (student_records.count_documents({'username': username}) == 1):
        student_records.delete_one({'username': username})
        return {"success": True}
    
    return {"success": False}

# --- Professor account CRUD Operations ---------------------------------------------------------- #

# Create a new professor account
@app.route('/api/professor-register', methods=['POST'])
def create_professor_account():
    firstName = request.args['firstName']
    lastName = request.args['lastName']
    photoURL = request.args['photoURL']
    username = request.args['username']
    password = request.args['password']

    if (professor_records.count_documents({'username': username}) == 1):
        return {"success": False}

    professor_records.insert_one({'firstname': firstName, 'lastname': lastName, 'username': username, 'password': password, 'photoURL': photoURL})
    return {"success": True}

# Check if a professor's username exists
@app.route('/api/check-professor-username', methods=['GET'])
def check_professor_username():
    username = request.args['username']

    success = professor_records.count_documents({'username': username}) == 1
    return {"success": success}

# Access a professor's profile
@app.route('/api/professor-profile', methods=['GET'])
def professor_profile():
    username = request.args['username']

    professor = professor_records.find({"username": username})[0]
    del professor['_id']

    return professor

# Authenticate professor login
@app.route('/api/professor-login', methods=['GET'])
def authenticate_professor_login():
    username = request.args['username']
    password = request.args['password']
    
    success = professor_records.count_documents({'username': username, 'password': password}) == 1
    return {"success": success}

# Delete a professor account
@app.route('/api/professor-delete', methods=['DELETE'])
def delete_professor_account():
    username = request.args['username']

    if (professor_records.count_documents({'username': username}) == 1):
        professor_records.delete_one({'username': username})
        return {"success": True}
    
    return {"success": False}

# --- Course CRUD Operations --------------------------------------------------------------------- #

# Create a new course
@app.route('/api/create-course', methods=['POST'])
def create_course():
    courseName = request.args['courseName']
    professor = request.args['professor']
    description = request.args['description']

    courses.insert_one({"name": courseName, "description": description, "students": [], "professor": professor})
    
    return {"success": True}

# Get course details given the course name
@app.route('/api/course-details', methods=['GET'])
def course_details():
	courseName = request.args['courseName']
	course = courses.find({"name": courseName})[0]

	return {"name": course['name'], "description": course['description'], "students": course['students'], "professor": course['professor']}

# Get all courses that the student can enroll in
@app.route('/api/available-courses', methods=['GET'])
def available_courses():
    username = request.args['username']
    courses_json = []
    enrolled_json= []

    if courses.find({}):
        for course in courses.find({"students":username}).sort("name"):
            enrolled_json.append({"name": course['name'], "description": course['description'], "students": course['students'], "professor": course['professor']})

        for course in courses.find({}).sort("name"):
               courses_json.append({"name": course['name'], "description": course['description'], "students": course['students'], "professor": course['professor']})

    unenrolled_json = [course for course in courses_json if course not in enrolled_json]

    return json.dumps(unenrolled_json)

# Get all courses that the student has enrolled in
@app.route('/api/enrolled-courses', methods=['GET'])
def enrolled_courses():
    username = request.args['username']
    courses_json = []

    if courses.find({}):
        for course in courses.find({"students":username}).sort("name"):
            courses_json.append({"name": course['name'], "description": course['description'], "students":course['students'], "professor": course['professor']})
    
    return json.dumps(courses_json)

# Get all courses that the professor has created
@app.route('/api/created-courses', methods=['GET'])
def created_courses():
    username = request.args['username']
    courses_json = []

    if courses.find({}):
        for course in courses.find({"professor":username}).sort("name"):
            courses_json.append({"name": course['name'], "description": course['description'], "students": course['students'], "professor": course['professor']})
    
    return json.dumps(courses_json)

# Delete a course
@app.route('/api/delete-course', methods=['DELETE'])
def delete_course():
    courseName = request.args['courseName']

    courses.delete_one({"name": courseName})
    
    return {"success": True}

# --- Course Enrollment & Unenrollment ----------------------------------------------------------- #

@app.route('/api/enroll-course', methods=['POST'])
def enroll_course():
   username = request.args['username']
   courseName = request.args['courseName']

   courses.update_one({"name": courseName}, {'$push': {"students": username}})

   return {"success": True}

@app.route('/api/unenroll-course', methods=['POST'])
def unenroll_course():
    username = request.args['username']
    courseName = request.args['courseName']

    courses.update_one({"name": courseName}, {'$pull': {"students": username}})

    return {"success": True}
    
# --- Forum Posts CRUD Operations ---------------------------------------------------------------- #

@app.route('/api/create-post', methods=['POST'])
def create_post():
   username = request.args['username']
   courseName = request.args['courseName']
   content = request.args['content']
   usertype = request.args['userType']
   dateTimeObj = datetime.now()

   forum.insert_one({"courseName": courseName, "content": content, "username": username, "time": str(dateTimeObj), "usertype": usertype})
   
   return {"success": True}

@app.route('/api/view-posts', methods=['GET'])
def view_all_posts():
    courseName = request.args['courseName']
    posts_json = []

    if forum.find({}):
        for post in forum.find({"courseName": courseName}):
            posts_json.append({"courseName": post['courseName'], "content": post['content'], "username": post['username'], "time": post['time'], "usertype": post['usertype']})
    
    posts_json.sort(key=lambda x:x['time'], reverse=True)

    return json.dumps(posts_json)
    
@app.route('/api/delete-post', methods=['DELETE'])
def delete_post():
   courseName = request.args['courseName']
   username = request.args['username']
   time = request.args['time']

   forum.delete_one({"courseName": courseName, "username": username, "time": time})

   return {"success": True}

# --- Assignments CRUD Operations ---------------------------------------------------------------- #

@app.route('/api/create-assignment', methods=['POST'])
def create_assignement():
   assignmentName=request.args['assignmentName']
   ProblemLink=request.args['problemLink']
   courseName = request.args['courseName']
   deadline= request.args['deadline']
   
   dateTimeObj = datetime.now()
   
   assignment.insert_one({"courseName": courseName,"assignmentName":assignmentName,"ProblemLink":ProblemLink,"deadline":deadline,"time": str(dateTimeObj)})
   return {"success": True}

@app.route('/api/view-assignments', methods=['GET'])
def view_assignment():
    courseName = request.args['courseName']
    
    username = request.args['username']
    assignment_json = []
    submitted="False"
       
    # if submission.find({}):
    #     for submissions in submission.find({"courseName": courseName,"username": username}):
    #         submitted="True"
    #         grade=submissions['grade']
    if assignment.find({}):
        for assignments in assignment.find({"courseName": courseName}):
            assignment_json.append({"courseName": assignments['courseName'], "assignmentName": assignments['assignmentName'], "ProblemLink": assignments['ProblemLink'], "deadline": assignments['deadline'], "time": assignments['time'],"submitted":submitted, "grade":"NA"})
   
    assignment_json.sort(key=lambda x:x['time'])
    return json.dumps(assignment_json)
    
@app.route('/api/create-submission', methods=['POST'])
def create_submission():
   assignmentName=request.args['assignmentName']
   username = request.args['username']
   SubmissionLink=request.args['submissionLink']
   courseName = request.args['courseName']
   dateTimeObj = datetime.now()
   submission.insert_one({"courseName": courseName,"assignmentName":assignmentName,"username":username,"SubmissionLink":SubmissionLink,"grade":"NA","time": str(dateTimeObj)})
   return {"success": True}

@app.route('/api/view-submission', methods=['GET'])
def view_submission():
    courseName = request.args['courseName']
    assignmentName=request.args['assignmentName']
    submission_json = []

    if submission.find({}):
        for submissions in submission.find({"courseName": courseName,"assignmentName":assignmentName}):
            submission_json.append({"courseName": submissions['courseName'], "assignmentName": submissions['assignmentName'],"username":submissions['username'],"SubmissionLink":submissions['SubmissionLink'],"grade":submissions['grade'],"time": submissions['time']})
    if(submission_json==None):
        return{"none":none}
    submission_json.sort(key=lambda x:x['time'], reverse=True)
    return json.dumps(submission_json)

@app.route('/api/grade-assignment', methods=['POST'])
def grade_assignement():
   assignmentName=request.args['assignmentName']
   username = request.args['username']
   courseName = request.args['courseName']
   grade=request.args['grade']
   submission.update_one({"courseName": courseName,"assignmentName":assignmentName,"username":username},{'$set':{"grade":grade}})
   return {"success": True}

if __name__ == "__main__":
    app.run(debug=True)