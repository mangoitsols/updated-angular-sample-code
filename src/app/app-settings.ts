export const appSetting = {
    role:{
        ['member']:{
            create: {
                event: 'Yes',
                message: 'No',
                appointments: 'No',
                groups: 'No',
                news: 'Yes',
                task: 'Yes',
                subrask: 'Yes',
                document:'No',
                chat:'Yes',
                contact_admin:'No'

            },
            participate: {
                event: 'Yes',
                message: 'Yes',
                appointments: 'Yes',
                groups: 'Yes',
                news: 'Yes',
                task: 'Yes',
                subrask: 'Yes',
                document:'Yes',
                chat:'Yes',
                personal_message:'Yes',
                club_message:'Yes',
                group_message:'Yes',
                organizer_myDocument:'Yes',
                organizer_clubDocument:'Yes',
                organizer_currentStatus:'Yes',
                organizer_archivedDocument:'Yes'
            },
            authorization: {
                event: 'Yes',
                message: 'Yes',
                appointments: 'Yes',
                groups: 'Yes',
                news: 'Yes',
                task: 'Yes',
                subrask: 'Yes',
                document:'No',
                chat:'Yes'
            }
        },
        ['guest']:{
            create: {
                event: 'No',
                message: 'No',
                appointments: 'No',
                groups: 'No',
                news: 'No',
                task: 'No',
                subrask: 'No',
                document:'No',
                chat:'No',
                contact_admin:'Yes'
            },
            participate: {
                event: 'Yes',
                message: 'Yes',
                appointments: 'Yes',
                groups: 'No',
                news: 'Yes',
                task: 'No',
                subrask: 'No',
                document:'Yes',
                chat:'No',
                personal_message:'Yes',
                club_message:'No',
                group_message:'No',
                organizer_myDocument:'No',
                organizer_clubDocument:'Yes',
                organizer_currentStatus:'No',
                organizer_archivedDocument:'No'
            },
            authorization: {
                event: 'No',
                message: 'No',
                appointments: 'No',
                groups: 'No',
                news: 'Yes',
                task: 'No',
                subrask: 'No',
                document:'No',
                chat:'No'
            }
        },
        ['secretary']:{
            create: {
                event: 'Yes',
                message: 'Yes',
                appointments: 'Yes',
                groups: 'Yes',
                news: 'Yes',
                task: 'Yes',
                subrask: 'Yes',
                document:'Yes',
                chat:'Yes',
                contact_admin:'No'

            },
            participate: {
                event: 'Yes',
                message: 'Yes',
                appointments: 'Yes',
                groups: 'Yes',
                news: 'Yes',
                task: 'Yes',
                subrask: 'Yes',
                document:'Yes',
                chat:'Yes',
                personal_message:'Yes',
                club_message:'Yes',
                group_message:'Yes',
                organizer_myDocument:'Yes',
                organizer_clubDocument:'Yes',
                organizer_currentStatus:'Yes',
                organizer_archivedDocument:'Yes'
            },
            authorization: {
                event: 'Yes',
                message: 'Yes',
                appointments: 'Yes',
                groups: 'Yes',
                news: 'Yes',
                task: 'Yes',
                subrask: 'Yes',
                document:'Yes',
                chat:'Yes'
            }
        },
        ['editor']:{
            create: {
                event: 'Yes',
                message: 'Yes',
                appointments: 'Yes',
                groups: 'Yes',
                news: 'Yes',
                task: 'Yes',
                subrask: 'Yes',
                document:'Yes',
                chat:'Yes',
                contact_admin:'No'

            },
            participate: {
                event: 'Yes',
                message: 'Yes',
                appointments: 'Yes',
                groups: 'Yes',
                news: 'Yes',
                task: 'Yes',
                subrask: 'Yes',
                document:'Yes',
                chat:'Yes',
                personal_message:'Yes',
                club_message:'Yes',
                group_message:'Yes',
                organizer_myDocument:'Yes',
                organizer_clubDocument:'Yes',
                organizer_currentStatus:'Yes',
                organizer_archivedDocument:'Yes'
            },
            authorization: {
                 event: 'Yes',
                message: 'Yes',
                appointments: 'Yes',
                groups: 'Yes',
                news: 'Yes',
                task: 'Yes',
                subrask: 'Yes',
                document:'Yes',
                chat:'Yes'
            }
        },
        ['user']:{
            create: {
                event: 'No',
                message: 'No',
                appointments: 'No',
                groups: 'No',
                news: 'No',
                task: 'No',
                subrask: 'No',
                document:'No',
                chat:'No',
                contact_admin:'No'
            },
            participate: {
                event: 'No',
                message: 'No',
                appointments: 'No',
                groups: 'No',
                news: 'No',
                task: 'No',
                subrask: 'No',
                document:'No',
                chat:'No',
                personal_message:'Yes',
                club_message:'Yes',
                group_message:'Yes',
                organizer_myDocument:'Yes',
                organizer_clubDocument:'Yes',
                organizer_currentStatus:'Yes',
                organizer_archivedDocument:'Yes'
            },
            authorization: {
                event: 'No',
                message: 'No',
                appointments: 'No',
                groups: 'No',
                news: 'Yes',
                task: 'No',
                subrask: 'No',
                document:'No',
                chat:'No'
            }
        }
    },
    priorities:{
        low: 8,
        medium: 7,
        high: 2,
    },
    uploadDocument:{
        myDocument: ["admin", "funcionary"],
        clubDocument: ["admin", "funcionary"],
        currentStatus: ["admin", "funcionary"],
        archivedDocument: ["admin", "funcionary"]
    },
    documentVisibility:{
        clubDocument: ""
    },
    extensions:{
        sketch: "assets/img/doc-icons/sketch.svg",
        folder: "assets/img/doc-icons/folder.svg",
        zip: "assets/img/doc-icons/folder.svg",
        psd: "assets/img/doc-icons/psd.svg",
        ppt: "assets/img/doc-icons/p.svg",
        pptx: "assets/img/doc-icons/p.svg",
        png: "assets/img/doc-icons/png_ic.png",
        jpg: "assets/img/doc-icons/jpg_ic.png",
        jpeg: "assets/img/doc-icons/jpg_ic.png",
        ai: "assets/img/doc-icons/Ai.svg",
        pdf: "assets/img/doc-icons/adobe.svg",
        docx: "assets/img/doc-icons/word.svg",
        docs: "assets/img/doc-icons/word.svg",
        txt: "assets/img/doc-icons/word.svg",
        xls: "assets/img/doc-icons/x.svg",
        xlsx: "assets/img/doc-icons/x.svg"
    }, 
    imageType :['jpg', 'jpeg', 'png','gif','psd']
 }