import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from "@vue/test-utils";
import Register from '../Register.vue'
import { useRoute } from 'vue-router';
import { nextTick } from 'vue';
import jwt from 'jsonwebtoken';


vi.mock('vue-router', () => {
    return {
        useRoute: vi.fn(() => ({
            path: '/Router',
        })),
        useRouter: vi.fn(() => ({
            push: vi.fn(),
        })),
    };
});


describe('Register Component', () => {
    it('renders properly', () => {
        const wrapper = mount(Register)
        expect(wrapper.text()).toContain('Register')
    })

    it('has a form with firstname, lastname, email, code and password fields', () => {
        const wrapper = mount(Register)
        const firstName = wrapper.find('input[name="firstname"]')
        const lastName = wrapper.find('input[name="lastname"]')
        const emailInput = wrapper.find('input[name="email"]')
        const codeInput = wrapper.find('input[name="code"]')
        const passwordInput = wrapper.find('input[name="password"]')

        expect(firstName.exists()).toBe(true)
        expect(lastName.exists()).toBe(true)
        expect(emailInput.exists()).toBe(true)
        expect(codeInput.exists()).toBe(true)
        expect(passwordInput.exists()).toBe(true)
    })

    it('validates first last and email input', async () => {
        const mockedUseRoute = useRoute as unknown as ReturnType<typeof vi.fn>;
        mockedUseRoute.mockReturnValue({
            path: '/test-path',
        });


        const wrapper = mount(Register)
        const form = wrapper.find('form')
        const firstName = wrapper.find('input[name="firstname"]')
        const lastName = wrapper.find('input[name="lastname"]')
        const emailInput = wrapper.find('input[name="email"]')

        await firstName.setValue('')
        const submitButton = wrapper.find('input[type="button"]')
        await submitButton.trigger('click')
        await nextTick()
        expect(wrapper.vm.warningmessage).toBe('First name is required')

        await firstName.setValue('testuser')
        await lastName.setValue('')
        await submitButton.trigger('click')
        await nextTick()
        expect(wrapper.vm.warningmessage).toBe('Last name is required')

        await lastName.setValue('testuser')
        await emailInput.setValue('')
        await submitButton.trigger('click')
        await nextTick()
        expect(wrapper.vm.warningmessage).toBe('Email is required')


    })
    it('reads jwt token from route',async () => {
        const exampleToken = jwt.sign({
            firstname: "Max",
            lastname: "Mustermann",
            email: "musterman@web.de",
            role: "admin",
        }, 'secret')

        const mockedUseRoute = useRoute as unknown as ReturnType<typeof vi.fn>;
        mockedUseRoute.mockReturnValue({
            path: '/register',
            params: { token: exampleToken },
        });
        const wrapper = mount(Register)
        await nextTick() // the function must be awaited to wait for the next tick

        const firstName =  wrapper.find('input[name="firstname"]').element as HTMLInputElement
        const lastName = wrapper.find('input[name="lastname"]').element as HTMLInputElement
        const emailInput = wrapper.find('input[name="email"]').element as HTMLInputElement

        expect(firstName.value).toEqual('Max')
        expect(lastName.value).toEqual('Mustermann')
        expect(emailInput.value).toEqual('musterman@web.de')

    })

    it('reads jwt token from input', async () => {
        const exampleToken = jwt.sign({
            firstname: "Max",
            lastname: "Mustermann",
            email: "musterman@web.de",
            role: "admin",
        }, 'secret')

        const mockedUseRoute = useRoute as unknown as ReturnType<typeof vi.fn>;
        mockedUseRoute.mockReturnValue({
            path: '/register',
        });
        const wrapper = mount(Register)
        const codeInput = wrapper.find('input[name="code"]')
        codeInput.setValue(exampleToken)
        await nextTick()
        
        const firstName =  wrapper.find('input[name="firstname"]').element as HTMLInputElement
        const lastName = wrapper.find('input[name="lastname"]').element as HTMLInputElement
        const emailInput = wrapper.find('input[name="email"]').element as HTMLInputElement

        expect(firstName.value).toEqual('Max')
        expect(lastName.value).toEqual('Mustermann')
        expect(emailInput.value).toEqual('musterman@web.de')

    })

    it('correct passwords are detected', async () => {
        const wrapper = mount(Register)
        const form = wrapper.find('form')
        const passwordInput = wrapper.find('input[name="password"]')

        await passwordInput.setValue('1234567gd')
        await nextTick()
        expect(wrapper.vm.warningmessage).toEqual('')
        await passwordInput.setValue('12345asd67')
        await nextTick()
        expect(wrapper.vm.warningmessage).toEqual('')
        await passwordInput.setValue('asd1234567')
        await nextTick()
        expect(wrapper.vm.warningmessage).toEqual('')
    })
    it('faulty passwords are detected', async () => {
        const wrapper = mount(Register)
        const form = wrapper.find('form')
        const passwordInput = wrapper.find('input[name="password"]')

        await passwordInput.setValue('1234')
        await nextTick()
        expect(wrapper.vm.warningmessage).toEqual('Password must be at least 8 characters long')
        await passwordInput.setValue('1234523467')
        await nextTick()
        expect(wrapper.vm.warningmessage).toEqual('Password must contain at least one letter and one number')
        await passwordInput.setValue('sdfsdfgasdgadfg')
        await nextTick()
        expect(wrapper.vm.warningmessage).toEqual('Password must contain at least one letter and one number')
    })

    afterEach(() => {
        vi.clearAllMocks(); // Reset all mocked calls between tests
    });
})