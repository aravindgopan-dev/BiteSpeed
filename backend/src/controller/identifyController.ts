import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { createError } from "../utils/errorUtils";


export interface IdentifyRequest {
    email?: string;
    phoneNumber?: string;
}

export interface IdentifyResponse {
    contact: {
        primaryContactId: number;
        emails: string[];
        phoneNumbers: string[];
        secondaryContactIds: number[];
    };
}

const prisma = new PrismaClient();

const controller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, phoneNumber }: IdentifyRequest = req.body;
        
        if (!email && !phoneNumber) {
            return next(createError("Email or phone number is required", 400));
        }

        const whereConditions = [];
        if (email) whereConditions.push({ email });
        if (phoneNumber) whereConditions.push({ phoneNumber });

        const existingContacts = await prisma.contact.findMany({
            where: { OR: whereConditions },
            orderBy: { createdAt: 'asc' }
        });

        if (existingContacts.length === 0) {
            const newContact = await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: "primary",
                }
            });

            const response: IdentifyResponse = {
                contact: {
                    primaryContactId: newContact.id,
                    emails: email ? [email] : [],
                    phoneNumbers: phoneNumber ? [phoneNumber] : [],
                    secondaryContactIds: [],
                }
            };

            res.status(201).json(response);
            return;
        }

        let primaryContact = existingContacts.find(contact => 
            contact.linkPrecedence === "primary"
        ) || existingContacts[0];

        const existingEmails = new Set<string>();
        const existingPhones = new Set<string>();

        existingContacts.forEach(contact => {
            if (contact.email) existingEmails.add(contact.email);
            if (contact.phoneNumber) existingPhones.add(contact.phoneNumber);
        });

        if ((email && !existingEmails.has(email)) || 
            (phoneNumber && !existingPhones.has(phoneNumber))) {
            await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkedId: primaryContact.id,
                    linkPrecedence: "secondary",
                }
            });
        }

        await Promise.all(existingContacts.map(contact => {
            if (contact.id !== primaryContact.id && contact.linkPrecedence === "primary") {
                return prisma.contact.update({
                    where: { id: contact.id },
                    data: {
                        linkPrecedence: "secondary",
                        linkedId: primaryContact.id
                    }
                });
            }
        }));

        const allContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: primaryContact.id },
                    { linkedId: primaryContact.id }
                ]
            }
        });

       
        const allEmails = [...new Set(
            allContacts
                .map(contact => contact.email)
                .filter((email): email is string => email !== null) // Ensure only strings
        )];

        const allPhones = [...new Set(
            allContacts
                .map(contact => contact.phoneNumber)
                .filter((phone): phone is string => phone !== null) // Ensure only strings
        )];

        const secondaryIds = allContacts
            .filter(contact => contact.id !== primaryContact.id)
            .map(contact => contact.id);

        const response: IdentifyResponse = {
            contact: {
                primaryContactId: primaryContact.id,
                emails: email && !allEmails.includes(email) ? [...allEmails, email] : allEmails,
                phoneNumbers: phoneNumber && !allPhones.includes(phoneNumber) ? [...allPhones, phoneNumber] : allPhones,
                secondaryContactIds: secondaryIds
            }
        };

        res.status(200).json(response);
        
    } catch (error) {
        console.error("Error in controller:", error);
        
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            return next(createError("Contact with the same email or phone number already exists", 409));
        } 
        
        next(createError("Internal Server Error", 500));
    }
};


const getidentity=async(_req:Request,res:Response,next:NextFunction)=>{
    try{
        const data=await prisma.contact.findMany({})
        res.send(data)
    }
    catch(err){
        next(createError("error in fetching data"))
    }
}
export {getidentity,controller}


