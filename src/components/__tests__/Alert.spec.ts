import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Alert from '../Alert.vue'

describe('Alert', () => {

    it('renders properly', () => {
        const wrapper = mount(Alert, { props: { message: 'Hello Vitest' } })
        expect(wrapper.text()).toContain('Hello Vitest')
    })
    it('renders properly shows default', () => {
        const wrapper = mount(Alert, { props: { message: 'Hello Vitest' } })
        expect(wrapper.text()).toContain('Hello Vitest')
        
        // check outer div
        const outerDiv = wrapper.find('.alert');
        expect(outerDiv.exists()).toBe(true); 
        expect(outerDiv.classes()).toContain('alert'); 

        // check inner div
        const innerDiv = wrapper.find('.alert-info');  
        expect(innerDiv.exists()).toBe(true); 
        expect(innerDiv.classes()).toContain('alert'); 
        expect(innerDiv.classes()).toContain('alert-info');

    })
    it('renders properly shows erros', () => {
        const wrapper = mount(Alert, { props: { message: 'Hello Vitest', type : "danger" } })
        expect(wrapper.text()).toContain('Hello Vitest')
        
        // check outer div
        const outerDiv = wrapper.find('.alert');
        expect(outerDiv.exists()).toBe(true); 
        expect(outerDiv.classes()).toContain('alert'); 

        // check inner div
        const innerDiv = wrapper.find('.alert-danger');  
        expect(innerDiv.exists()).toBe(true); 
        expect(innerDiv.classes()).toContain('alert'); 
        expect(innerDiv.classes()).toContain('alert-danger');
    })
    it('renders properly shows success', () => {
        const wrapper = mount(Alert, { props: { message: 'Hello Vitest', type : "success" } })
        expect(wrapper.text()).toContain('Hello Vitest')
        
        // check outer div
        const outerDiv = wrapper.find('.alert');
        expect(outerDiv.exists()).toBe(true); 
        expect(outerDiv.classes()).toContain('alert'); 

        // check inner div
        const innerDiv = wrapper.find('.alert-success');  
        expect(innerDiv.exists()).toBe(true); 
        expect(innerDiv.classes()).toContain('alert'); 
        expect(innerDiv.classes()).toContain('alert-success');
    })
    it('renders properly shows warning', () => {
        const wrapper = mount(Alert, { props: { message: 'Hello Vitest', type : "warning" } })
        expect(wrapper.text()).toContain('Hello Vitest')
        
        // check outer div
        const outerDiv = wrapper.find('.alert');
        expect(outerDiv.exists()).toBe(true); 
        expect(outerDiv.classes()).toContain('alert'); 

        // check inner div
        const innerDiv = wrapper.find('.alert-warning');  
        expect(innerDiv.exists()).toBe(true); 
        expect(innerDiv.classes()).toContain('alert'); 
        expect(innerDiv.classes()).toContain('alert-warning');
    })
    it('renders properly shows info', () => {
        const wrapper = mount(Alert, { props: { message: 'Hello Vitest', type : "info" } })
        expect(wrapper.text()).toContain('Hello Vitest')
        
        // check outer div
        const outerDiv = wrapper.find('.alert');
        expect(outerDiv.exists()).toBe(true); 
        expect(outerDiv.classes()).toContain('alert'); 

        // check inner div
        const innerDiv = wrapper.find('.alert-info');  
        expect(innerDiv.exists()).toBe(true); 
        expect(innerDiv.classes()).toContain('alert'); 
        expect(innerDiv.classes()).toContain('alert-info');
    })
})