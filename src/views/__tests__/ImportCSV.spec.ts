import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { nextTick } from 'vue'
import ImportCSV from '../ImportCurseList.vue'

describe('Basic functionality', () => {

    // This test checks if the component renders properly
    it('renders properly', () => {
        const wrapper = mount(ImportCSV)
        expect(wrapper.text()).toContain('Import Course List')
    })
    it('file selected function exists', () => {
        const wrapper = mount(ImportCSV)
        expect(wrapper.vm.fileSelected).toBeDefined()
    })
    it('reads correct csv file', async () => {
        const wrapper = mount(ImportCSV)
        const mockFile = new File(["name,email\nAnni,test@gmail.com\nFritz,test@web.de"], "test.csv", {
            type: "text/csv",
        });

        // before that it should be false
        expect(wrapper.vm.importedStatus).toEqual(false)
        // trigger change event


        const result = await wrapper.vm.fileSelected({
            target: {
                files: [mockFile]
            }
        });
        expect(wrapper.vm.importedStatus).toEqual(true)
        expect(wrapper.vm.importedCourses).toEqual([
            { name: 'Anni', email: 'test@gmail.com' },
            { name: 'Fritz', email: 'test@web.de' }])

        expect(wrapper.vm.warningmessage).toEqual('')
        expect(Object.keys(wrapper.vm.attributesinCSV)).toEqual(['name', 'email'])
    })
    it('handles empty csv file', async () => {
        const wrapper = mount(ImportCSV)
        const mockFile = new File([""], "wrong.csv", {
            type: "text/csv",
        });

        // before that it should be false
        expect(wrapper.vm.importedStatus).toEqual(false)

        // trigger change event
        const result = await wrapper.vm.fileSelected({
            target: {
                files: [mockFile]
            }
        });

        // Check if the importedStatus is still false due to wrong CSV format
        expect(wrapper.vm.importedStatus).toEqual(false)
        expect(wrapper.vm.warningmessage).toEqual('No data found in the file!')
        // Check if importedCourses is empty due to wrong CSV format
        expect(wrapper.vm.importedCourses).toEqual([])
    })

    it('handels the selection of the attributes', async () => {
        const wrapper = mount(ImportCSV)
        const mockFile = new File(["name,email\nAnni,mail@test.de\nFritz,mail@test.de"], "test.csv", {
            type: "text/csv",
        });
        const result = await wrapper.vm.fileSelected({
            target: {
                files: [mockFile]
            }
        });
        expect(wrapper.vm.importedStatus).toEqual(true)
        expect(wrapper.vm.attributesinCSV).toEqual({ name: '', email: '' })

        // initial state
        expect(wrapper.vm.checkifNeededAttributesAreSelected).toEqual(false)
    })

})
describe('ImportCSV upload', () => {
    it('should upload the csv file', async () => {
        const wrapper = mount(ImportCSV)
        const mockFile = new File(["name,email\nAnni, test@test.de\nFritz, test.de"], "test.csv", {
            type: "text/csv",
        });
        const result = await wrapper.vm.fileSelected({
            target: {
                files: [mockFile]
            }
        });
        wrapper.vm.attributesinCSV = { name: 'first and lastname', email: 'email' };

        const mockResponse = {
            userId: 1,
            id: 1,
            title: 'Test Todo',
            completed: false,
        };
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse),
                headers: new Headers(),
                redirected: false,
                statusText: 'OK',
                type: 'basic',
                url: '',
                clone: () => this,
                body: null,
                bodyUsed: false,
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
                blob: () => Promise.resolve(new Blob()),
                formData: () => Promise.resolve(new FormData()),
                text: () => Promise.resolve(''),
            } as unknown as Response),
        );
        await wrapper.vm.importCourses();
        expect(wrapper.vm.warningmessage).toEqual('')
        expect(wrapper.vm.modus).toEqual('uploading')

        // more could not be tested because of the missing websocket connection
        // This will be tested in the e2e tests
    })
    afterEach(() => {
        vi.clearAllMocks(); // Reset all mocked calls between tests
    });
})

describe('checkifNeededAttributesAreSelected', () => {
    const wrapper = mount(ImportCSV)
    it('should return false if email is not selected', () => {
        wrapper.vm.attributesinCSV = { firstname: "firstname", lastname: "lastname" };
        expect(wrapper.vm.checkifNeededAttributesAreSelected).toBe(false);
    });
    it('should return false if firstname and lastname are not selected', () => {
        wrapper.vm.attributesinCSV = { email: "email" };
        expect(wrapper.vm.checkifNeededAttributesAreSelected).toBe(false);
    });

    it('should return false if only firstname is selected', () => {
        wrapper.vm.attributesinCSV = { email: "email", firstname: "firstname" };
        expect(wrapper.vm.checkifNeededAttributesAreSelected).toBe(false);
    });

    it('should return false if only lastname is selected', () => {
        wrapper.vm.attributesinCSV = { email: "email", lastname: "lastname" };
        expect(wrapper.vm.checkifNeededAttributesAreSelected).toBe(false);
    });
    it('should return true if email, firstname, and lastname are selected', () => {
        wrapper.vm.attributesinCSV = { email: "email", firstname: "firstname", lastname: "lastname" };
        expect(wrapper.vm.checkifNeededAttributesAreSelected).toBe(true);
    });

    it('should return true if email and first and lastname are selected', () => {
        wrapper.vm.attributesinCSV = { email: "email", "first and lastname": "first and lastname" };
        expect(wrapper.vm.checkifNeededAttributesAreSelected).toBe(true);
    });
});

describe('check if attributes are not selected multiple times', () => {
    it('should return false if email is selected multiple times', () => {
        const wrapper = mount(ImportCSV)
        wrapper.vm.attributesinCSV = { email: "email", email: "email" };
        expect(wrapper.vm.checkifNeededAttributesAreSelected).toBe(false);
    });
})