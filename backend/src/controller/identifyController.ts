import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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

const controller = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, phoneNumber }: IdentifyRequest = req.body;
        
        if (!email && !phoneNumber) {
            res.status(400).json({ error: "Email or phone number is required" });
            return;
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

        // ✅ Fix TypeScript issue: Ensure emails & phoneNumbers are non-null
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
            res.status(409).json({ error: "Contact with the same email or phone number already exists" });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

export default controller;
