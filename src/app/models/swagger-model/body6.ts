/**
 * globy-backend
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 0.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { ClassesTeacher } from './classesTeacher';

export interface Body6 { 
    id?: string;
    name?: string;
    language?: string;
    subject?: string;
    country?: string;
    projectDuration?: number;
    meetingFrequency?: number;
    level?: number;
    languageLevel?: string;
    topics?: Array<string>;
    teacher?: ClassesTeacher;
    students?: Array<ClassesTeacher>;
}